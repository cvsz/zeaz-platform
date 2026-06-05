#!/usr/bin/env python3
import sys
import os

# Add the current directory to PYTHONPATH so src module is found
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.cli.run import main

if __name__ == "__main__":
    main()
