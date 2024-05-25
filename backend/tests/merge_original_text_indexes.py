import sys
sys.path.append('.')
import json
from text_utility import TextUtility
import os

ARE_ALL_TESTS_PASSING = True

def check(test_name, input, expected):
    global ARE_ALL_TESTS_PASSING
    actual = TextUtility.merge_original_texts(input)

    if expected != actual:
        print(f"Test failed: {test_name}\n")
        print(f"Expected: {expected}\n")
        print(f"Actual: {actual}\n")
        ARE_ALL_TESTS_PASSING = False


def test():

    no_overlap = [(0, 2, "l1"), (4, 8, "l2"), (9, 10, "l3")]
    expected = [(0, 2, "l1"), (4, 8, "l2"), (9, 10, "l3")]
    check("no_overlap", no_overlap, expected)
    

    no_overlap_unsorted = [(9, 10, "l3"), (0, 2, "l1"), (4, 8, "l2")]
    expected = [(0, 2, "l1"), (4, 8, "l2"), (9, 10, "l3")]
    check("no_overlap_unsorted", no_overlap_unsorted, expected)


    duplicity = [(2, 4, "l1"), (2, 4, "l2"), (2, 4, "l3")]
    expected = [(2, 4, "l1, l2, l3")]
    check("duplicity", duplicity, expected)


    common_first_index = [(2, 4, "l1"), (2, 6, "l2"), (2, 8, "l3")]
    expected = [(2, 4, "l1, l2, l3"), (5, 6, "l2, l3"), (7, 8, "l3")]
    check("common_first_index", common_first_index, expected)


    continuous_sequence = [(0, 2, "l1"), (2, 4, "l2"), (4, 6, "l3")]    
    expected = [(0, 6, "l1, l2, l3")]
    check("continuous_sequence", continuous_sequence, expected)


    simple_full_intersection = [(0, 10, "l1"), (2, 6, "l2")]    
    expected = [(0, 10, "l1, l2")]
    check("simple_full_intersection", simple_full_intersection, expected)


    full_intersection = [(0, 10, "l1"), (2, 6, "l2"), (3, 7, "l3"), (3, 10, "l4")]
    expected = [(0, 10, "l1, l2, l3, l4")]
    check("full_intersection", full_intersection, expected)


    half_intersection_simple = [(0, 10, "l1"), (5, 15, "l2")]
    expected = [(0, 4, "l1"), (5, 10, "l1, l2"), (11, 15, "l2")]
    check("half_intersection_simple", half_intersection_simple, expected)


    half_intersection = [(0, 10, "l1"), (5, 15, "l2"), (5, 20, "l3")]
    expected = [(0, 4, "l1"), (5, 10, "l1, l2, l3"), (11, 15, "l2, l3"), (16, 20, "l3")]
    check("half_intersection", half_intersection, expected)



def main():

    test()

    if ARE_ALL_TESTS_PASSING:
        print("All tests are passing")
    return



if __name__ == '__main__':
    main()