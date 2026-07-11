#!/bin/bash

# Read C++ code from stdin, save it, compile it, then run it
cat > /tmp/main.cpp

g++ /tmp/main.cpp -o /tmp/main 2>&1

if [ $? -ne 0 ]; then
  exit 1
fi

/tmp/main
