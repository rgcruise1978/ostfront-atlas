"""Shared geographic and chronological checks for all 22 dated selections.
The former 13-date gates are retained in validate-map-upgrade.py, along with
Phase II, reference borders, formations, logistics and current article hashes.
"""
import runpy
from pathlib import Path
runpy.run_path(str(Path(__file__).with_name('validate-map-upgrade.py')),run_name='__main__')
