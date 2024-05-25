#!/bin/bash
set -euo pipefail


# Generate classes
start=$(date +%s.%N)
python tests/suggestions_generator.py --user_choice classes
end_classes=$(date +%s.%N)

execution_time_classes=$(echo "$end_classes - $start" | bc)
echo "Classes execution time: $execution_time_classes seconds"


# Generate attributes
start_attributes=$(date +%s.%N)
python tests/suggestions_generator.py --user_choice attributes
end_attributes=$(date +%s.%N)

execution_time_attributes=$(echo "$end_attributes - $start_attributes" | bc)
echo "Attributes execution time: $execution_time_attributes seconds"


# Generate associations
start_associations=$(date +%s.%N)
python tests/suggestions_generator.py --user_choice associations1
end_associations=$(date +%s.%N)

execution_time_associations=$(echo "$end_associations - $start_associations" | bc)
echo "Associations execution time: $execution_time_associations seconds"

# Generate PlantUML diagrams for the generated results
python data-processing/plantUML_generator.py

execution_time_total=$(echo "$end_associations - $start" | bc)
echo "Total execution time: $execution_time_total seconds"
