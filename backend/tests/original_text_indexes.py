import sys
sys.path.append('.')
from text_utility import TextUtility
import os
import logging

#LOG_FILE_NAME = f"inferences-log.txt"
#logging.basicConfig(level=logging.DEBUG, format="%(message)s", filename=LOG_FILE_NAME, filemode='w')

# TODO: Create tests in file `inferences_tests.json`
# Each test has: inference text, [index: start of this inference in domain description, index: end of this inference in domain description]

def test(inference, domain_description, expected_inference_indexes):
    actual_inference_indexes, _, _ = TextUtility.find_text_in_domain_description(inference, domain_description)
    if not actual_inference_indexes == expected_inference_indexes:
        print(f"Test failed:\n- domain description: {domain_description}\n- inference: {inference}\n- expected inference indexes: {expected_inference_indexes}\n- actual inference indexes: {actual_inference_indexes}\n")
        TextUtility.show_inference_in_domain_description(actual_inference_indexes, domain_description)



def basic_tests():

    # Inference 1:1 in domain description
    domain_description = "This is the first sentence. This is the second sentence."
    inference = "the first sentence"
    expected_inference_indexes = [8, 26]
    test(inference, domain_description, expected_inference_indexes)

    inference = "the second sentence"
    expected_inference_indexes = [36, 55]
    test(inference, domain_description, expected_inference_indexes)


    # Case sensitive inference
    inference = "THE first SENTENCE"
    expected_inference_indexes = [8, 26]
    test(inference, domain_description, expected_inference_indexes)

    # Multiple occurencies of inference
    inference = "sentence"
    expected_inference_indexes = [18, 26, 47, 55]
    test(inference, domain_description, expected_inference_indexes)

    # Inference contains one typo
    domain_description = "This is the start of the first sentence and the second sentence."
    inference = "This is the start of the first Zentence"
    expected_inference_indexes = [0, 30, 32, 39]
    test(inference, domain_description, expected_inference_indexes)

    # Inference contains two typos
    # inference = "This is the Ztart of the first Zentence"
    # expected_inference_indexes = [0, 13, 14, 32, 33, 40]

    # Inference is incorrectly made from two isolated parts of text
    # The longest substring can be found in the beginning of the inference
    domain_description = "This is the start of the first sentence and the second sentence."
    inference = "This is the start of the second sentence"
    expected_inference_indexes = [0, 24, 48, 63]
    test(inference, domain_description, expected_inference_indexes)

    # The longest substring can be found in the end of the inference
    domain_description = "This is the first sentence and the second sentence."
    inference = "This is the second sentence."
    expected_inference_indexes = [0, 7, 31, 51]
    test(inference, domain_description, expected_inference_indexes)

    # The longest substring can be found in the middle of the inference
    domain_description = "This is the first sentence and the third sentence."
    inference = "This is sentence and the sentence"
    expected_inference_indexes = [0, 7, 18, 34, 41, 49]
    test(inference, domain_description, expected_inference_indexes)

    # Temp
    data_directory_path = os.path.join("data", "56-2001-extract-llm-assistant-test-case")
    file_name = "56-2001-extract-llm-assistant-test-case.txt"
    domain_description_file = os.path.join(data_directory_path, file_name)

    with open(domain_description_file, 'r') as file:
        domain_description = file.read().lower()

    # domain_description = "In addition, for a road vehicle it is stated:\n- the registration plate, the date on which the registration plate was assigned,\n- the purpose for which the road vehicle is intended, which is a taxi service vehicle, a vehicle with right of way, a car rental vehicle for hire, a vehicle for general use, or a vehicle for the operation of road transport for hire by its operator,\n- the category of road vehicle,\n- the manufacturer's factory mark as specified by the road vehicle manufacturer,\n- the trade name if specified by the road vehicle manufacturer,\n- the type as specified by the road vehicle manufacturer and the variant and version if specified by the road vehicle manufacturer.\n- the vehicle identification number (VIN) of the road vehicle and, if not, the chassis serial number of the road vehicle,\n- the engine data for the road vehicle that include the type of engine specified by the manufacturer of the road vehicle, the engine power specified by the road vehicle manufacturer in kW/rpm in the case of an internal combustion engine or in kW in the case of other engines, the displacement of the internal combustion engine as specified by the manufacturer of the road vehicle in cm3; and the fuel type of the road vehicle\n- type, serial number and colour of bodywork, number of seats and standing places or beds, dimensions of the loading area, volume of the box or tank,\n- data on technical inspections of the road vehicle which is the type of technical inspection carried out, the date on which the technical inspection was carried out, the date of validity of the technical inspection, the designation of the technical inspection station and data on the condition of the road vehicle according to the result of the technical inspection,"
        
    inference = "it is not listed as missing or stolen in the Schengen Information System or in the information system of the Police of the Czech Republic or this information is not established by another procedure"
    expected_inference_indexes = []
    test(inference, domain_description, expected_inference_indexes)


def check_inference_in_actual_output(domain_description, actual_output_file):

    with open(actual_output_file, 'r') as file:
        entity = ""
        property_name = ""

        inference_parts_found_sum = 0
        inference_parts_total_sum = 0

        for line in file:
            if line.startswith("Entity:"):
                entity = line[8:].strip()
            
            if not line or len(line) <= 2:
                continue
            
            if line[1] == ')':
                property_name = line[2:].strip()
            elif line[2] == ')':
                property_name = line[3:].strip()

            elif line.startswith("- inference:"):
                inference = line[12:].strip()
                result, inferece_parts_found, inferece_parts_total = TextUtility.find_text_in_domain_description(inference, domain_description)
                inference_parts_found_sum += inferece_parts_found
                inference_parts_total_sum += inferece_parts_total
                #print(f"Inference: {inference}\n")
                #TextUtility.show_inference_in_domain_description(result)
                #return

    print(f"Inferences successful: {inference_parts_found_sum}/{inference_parts_total_sum}")


def main():

    basic_tests()
    return

    data_directory_path = os.path.join("data", "56-2001-extract-llm-assistant-test-case")
    file_name = "56-2001-extract-llm-assistant-test-case.txt"
    domain_description_file = os.path.join(data_directory_path, file_name)

    with open(domain_description_file, 'r') as file:
        domain_description = file.read()
    
    # file_name = "2024-02-23-14-39-07-attributes-actual-output.txt"
    # actual_output_file = os.path.join(data_directory_path, file_name)

    # check_inference_in_actual_output(domain_description, actual_output_file)
    # return



    #inference = "An application for registration of a road vehicle in the register of road vehicles shall include ... details of the owner of the road vehicle"
    # inference = "the address of permanent residence, long-term residence, temporary residence of at least 6 months or other authorized residence,"
    inference = "if it is a legal person or a branch thereof, then the personal identification number, if any..."
    inference_indexes, _, _ = TextUtility.find_text_in_domain_description(inference, domain_description)

    
    if inference_indexes:
        #TextUtility.show_inference_in_domain_description(inference_indexes, domain_description)
        print(inference_indexes)
    else:
        print("Nothing found")



if __name__ == '__main__':
    main()