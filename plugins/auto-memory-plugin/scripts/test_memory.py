#!/usr/bin/env python3
"""
Test Suite for Auto Memory Plugin
Tests all memory-related functionality: storage, retrieval, pruning
"""

import json
import os
import sys
import tempfile
import shutil
import uuid
from pathlib import Path

# Paths - properly resolved at runtime
SCRIPT_DIR = Path(__file__).parent
PLUGIN_ROOT = SCRIPT_DIR.parent
TEST_MEMORY_DIR = PLUGIN_ROOT / "auto-data" / "test"


class MemoryTestSuite:
    """Test suite for memory plugin functionality."""

    def __init__(self):
        self.temp_dir = None
        self.test_session = f"test-session-{uuid.uuid4().hex[:8]}"
        self.results = []

    def setup(self):
        """Create temporary test directory."""
        self.temp_dir = tempfile.mkdtemp(prefix="memory_plugin_test_")
        print(f"Setup test directory: {self.temp_dir}")

    def teardown(self):
        """Clean up temporary test directory."""
        if self.temp_dir and os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir)
            print(f"Cleaned up: {self.temp_dir}")

    def run_all_tests(self):
        """Run all test functions."""
        print("\n" + "=" * 60)
        print("RUNNING MEMORY PLUGIN TEST SUITE")
        print("=" * 60 + "\n")

        tests = [
            ("Test 1: Memory Storage", self.test_store_memory),
            ("Test 2: Memory JSON Format", self.test_memory_json_format),
            ("Test 3: Memory Retrieval", self.test_retrieve_memory),
            ("Test 4: Two-Phase Retrieval", self.test_two_phase_retrieval),
            ("Test 5: Utility Validation", self.test_utility_validation),
            ("Test 6: Context Preservation", self.test_context_preservation),
            ("Test 7: Multiple Sessions", self.test_multiple_sessions),
            ("Test 8: Memory Anti-Duplicates", self.test_memory_uniqueness),
            ("Test 9: Pruning Functionality", self.test_pruning),
            ("Test 10: Edge Cases", self.test_edge_cases),
        ]

        passed = 0
        failed = 0

        for test_name, test_func in tests:
            print(f"\n{test_name}...", end=" ")
            try:
                test_func()
                print("✓ PASSED")
                passed += 1
                self.results.append((test_name, "PASSED", None))
            except AssertionError as e:
                print("✗ FAILED")
                failed += 1
                self.results.append((test_name, "FAILED", str(e)))
            except Exception as e:
                print("✗ ERROR")
                failed += 1
                self.results.append((test_name, "ERROR", str(e)))

        self.print_summary(passed, failed)
        return failed == 0

    def print_summary(self, passed, failed):
        """Print test summary."""
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"Total:  {passed + failed}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print("=" * 60 + "\n")

        if failed > 0:
            print("Failed Tests:")
            for name, status, error in self.results:
                if status == "FAILED" or status == "ERROR":
                    print(f"  - {name}: {error or status}")

    def test_store_memory(self):
        """Test storing a memory."""
        sys.path.insert(0, str(PLUGIN_ROOT))
        from scripts.store_memory import generate_memory_entry

        entry = generate_memory_entry(
            intent="Test intent",
            experience="Test experience",
            utility=0.7,
            session_id=self.test_session,
        )

        assert "id" in entry, "Memory entry should have an ID"
        assert entry["intent"] == "Test intent", "Intent should be stored"
        assert entry["experience"] == "Test experience", "Experience should be stored"
        assert entry["utility"] == 0.7, "Utility should be stored"
        assert "timestamp" in entry, "Memory should have a timestamp"
        assert entry["sessionId"] == self.test_session, "Session ID should match"

    def test_memory_json_format(self, memory_dir=None):
        """Test that stored memory is valid JSON with correct format."""
        if memory_dir is None:
            memory_dir = TEST_MEMORY_DIR / self.test_session

        # Create memory dir if needed
        memory_dir.mkdir(parents=True, exist_ok=True)

        # Import here
        sys.path.insert(0, str(PLUGIN_ROOT))
        from scripts.store_memory import generate_memory_entry

        entry = generate_memory_entry(
            intent="JSON Format Test",
            experience="Test experience for JSON format",
            utility=0.5,
            session_id=self.test_session,
        )

        # Save to a valid path
        memory_file = memory_dir / f"{entry['id']}.json"

        with open(memory_file, 'w') as f:
            json.dump(entry, f)

        # Load and verify
        with open(memory_file, 'r') as f:
            loaded = json.load(f)

        assert "id" in loaded, "Memory should have ID"
        assert "intent" in loaded, "Memory should have intent"
        assert "experience" in loaded, "Memory should have experience"
        assert "utility" in loaded, "Memory should have utility"
        assert "sessionId" in loaded, "Memory should have sessionId"
        assert "timestamp" in loaded, "Memory should have timestamp"
        assert loaded["utility"] == 0.5, "Utility should match"
        assert isinstance(loaded["utility"], float), "Utility should be float"

    def test_retrieve_memory(self):
        """Test memory retrieval with keywords."""
        sys.path.insert(0, str(PLUGIN_ROOT))
        from scripts.retrieve_memory import load_all_memories

        memories = load_all_memories()
        assert isinstance(memories, list), "Should return a list"

    def test_two_phase_retrieval(self):
        """Test two-phase retrieval algorithm."""
        sys.path.insert(0, str(PLUGIN_ROOT))
        from scripts.retrieve_memory import similarity_based_recall, value_aware_selection

        # Create test data
        test_memories = [
            {"id": "1", "intent": "React state hook fix", "experience": "Use useState instead of this.setState", "utility": 0.9},
            {"id": "2", "intent": "Python list comprehension", "experience": "Use [x for x in list if condition]", "utility": 0.8},
            {"id": "3", "intent": "Database connection pool", "experience": "Use SQLAlchemy with pool_size", "utility": 0.85},
        ]

        # Phase A: Similarity
        candidates = similarity_based_recall(
            "React state fix",
            memories=test_memories,
        )

        assert len(candidates) > 0, "Should find at least one candidate"
        found = any(c["id"] == "1" for c in candidates)
        assert found, "Should find the React memory"

        # Phase B: Value-aware
        results = value_aware_selection(
            candidates,
            lambda_=0.5,
            top_k=2,
        )

        assert len(results) > 0, "Should have results"
        if len(results) >= 2:
            assert results[0]["utility"] >= results[1]["utility"], "Should be sorted by value"

    def test_utility_validation(self):
        """Test utility value validation."""
        sys.path.insert(0, str(PLUGIN_ROOT))
        from scripts.store_memory import generate_memory_entry

        # Valid utilities
        for utility in [0.0, 0.5, 1.0]:
            entry = generate_memory_entry("test", "test", utility, "session")
            assert entry["utility"] == utility, f"Utility {utility} should be stored"

        # Invalid utilities should raise
        try:
            generate_memory_entry("test", "test", -0.1, "session")
            raise AssertionError("Should reject utility < 0.0")
        except ValueError:
            pass

        try:
            generate_memory_entry("test", "test", 1.1, "session")
            raise AssertionError("Should reject utility > 1.0")
        except ValueError:
            pass

    def test_context_preservation(self):
        """Test that context is preserved in stored memory."""
        sys.path.insert(0, str(PLUGIN_ROOT))
        from scripts.store_memory import generate_memory_entry

        context = {
            "file": "src/test.tsx",
            "fileType": "typescript-react",
            "changeType": "Edit",
            "project": "test-project",
        }

        entry = generate_memory_entry(
            intent="Test context",
            experience="Test experience",
            utility=0.7,
            session_id=self.test_session,
            context=context,
        )

        assert "context" in entry, "Memory should have context"
        assert entry["context"]["file"] == "src/test.tsx", "File should be preserved"
        assert entry["context"]["fileType"] == "typescript-react", "File type should be preserved"
        assert entry["context"]["project"] == "test-project", "Project should be preserved"

    def test_multiple_sessions(self):
        """Test storing memories across multiple sessions."""
        sys.path.insert(0, str(PLUGIN_ROOT))
        from scripts.store_memory import generate_memory_entry, save_memory

        # Clear any existing test sessions
        session_prefixes = ["test-session-a", "test-session-b", "test-session-c"]
        for session_id in session_prefixes:
            import shutil
            session_dir = PLUGIN_ROOT / "auto-data" / "sessions" / session_id
            if session_dir.exists():
                shutil.rmtree(session_dir)

        # Store memories with specific session IDs
        for sid in session_prefixes:
            entry = generate_memory_entry(
                intent=f"Session {sid} test",
                experience="Multi-session test",
                utility=0.6,
                session_id=sid,
            )
            save_memory(entry)

        # Verify all sessions exist and have memories
        for sid in session_prefixes:
            session_dir = PLUGIN_ROOT / "auto-data" / "sessions" / sid
            assert session_dir.exists(), f"Session {sid} directory should exist"
            memories = list(session_dir.glob("*.json"))
            assert len(memories) > 0, f"Session {sid} should have memories"

    def test_memory_uniqueness(self):
        """Test that memories are unique (no accidental duplicates)."""
        sys.path.insert(0, str(PLUGIN_ROOT))
        from scripts.store_memory import generate_memory_entry, save_memory

        # Clear any existing test session
        import shutil
        test_session_dir = PLUGIN_ROOT / "auto-data" / "sessions" / "unique-test-session"
        if test_session_dir.exists():
            shutil.rmtree(test_session_dir)

        # Create session directory
        test_session_dir.mkdir(parents=True, exist_ok=True)

        entry1 = generate_memory_entry(
            intent="Unique intent test",
            experience="Unique experience test",
            utility=0.7,
            session_id="unique-test-session",
        )

        entry2 = generate_memory_entry(
            intent="Unique intent test",
            experience="Unique experience test",
            utility=0.7,
            session_id="unique-test-session",
        )

        # Save both memories
        save_memory(entry1)
        save_memory(entry2)

        # Both memories should have different IDs
        assert entry1["id"] != entry2["id"], "Different memories should have different IDs"

        # Check they're actually different files
        test_memories = list(test_session_dir.glob("*.json"))
        assert len(test_memories) == 2, f"Should have 2 memories with same intent, found {len(test_memories)}"

    def test_pruning(self):
        """Test memory pruning functionality."""
        sys.path.insert(0, str(PLUGIN_ROOT))
        from scripts.prune_memories import prune_memories as prune

        # Run with dry-run
        result = prune(
            dry_run=True,
            max_old_age_days=30,
            min_utility_threshold=0.8,
        )

        assert "dry_run" in result, "Should have dry_run result"
        assert "sessions_cleaned" in result, "Should have sessions cleaned count"

    def test_edge_cases(self):
        """Test edge cases and boundary conditions."""
        sys.path.insert(0, str(PLUGIN_ROOT))
        from scripts.retrieve_memory import similarity_based_recall

        # Empty query
        memories = [
            {"id": "1", "intent": "React", "experience": "useState", "utility": 0.9},
        ]

        candidates = similarity_based_recall("", memories)
        assert len(candidates) == 0, "Empty query should return no candidates"

        # Very high similarity threshold - with keyword matching, similar words need to overlap
        # "React test" vs "React useState" - the word "React" should overlap
        candidates = similarity_based_recall("React test", memories, threshold=0.1)
        assert len(candidates) > 0, "Should handle threshold with keyword overlap"

    def test_hooks_config_format(self):
        """Test that hooks configuration is valid JSON."""
        hooks_config = PLUGIN_ROOT / "hooks" / "hooks.json"

        assert hooks_config.exists(), "Hooks configuration file should exist"

        with open(hooks_config) as f:
            config = json.load(f)

        assert "hooks" in config, "Config should have hooks key"
        assert isinstance(config["hooks"], dict), "Hooks should be a dict"
        assert len(config["hooks"]) > 0, "Should have at least one hook"


def main():
    """Run the test suite."""
    suite = MemoryTestSuite()

    try:
        suite.setup()
        success = suite.run_all_tests()
        return 0 if success else 1
    finally:
        suite.teardown()


if __name__ == "__main__":
    sys.exit(main())