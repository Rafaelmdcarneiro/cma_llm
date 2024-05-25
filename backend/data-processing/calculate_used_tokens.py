import re


def extract_prompt_tokens_count(log_line):
    match = re.search(r'n_prompt_tokens_processed=(\d+)', log_line)
    if match:
        return int(match.group(1))
    else:
        return 0


def extract_generated_tokens_count(log_line):
  match = re.search(r't_token_generation=(\d+)', log_line)
  if match:
      return int(match.group(1))
  else:
      return 0
  

def main():

  tokens_prompt_processed_sum = 0
  tokens_generation_sum = 0
  file_path = "log.txt"

  with open(file_path, 'r') as file:
    log_lines = file.readlines()
  
  for log_line in log_lines:
    prompt_tokens_count = extract_prompt_tokens_count(log_line)
    tokens_prompt_processed_sum += prompt_tokens_count

    generated_tokens_count = extract_generated_tokens_count(log_line)
    tokens_generation_sum += generated_tokens_count

  # Divide generated tokens by 2 because we added them twice
  tokens_sum = tokens_prompt_processed_sum + (tokens_generation_sum / 2)
  print(f"Total tokens prompt processed: {tokens_prompt_processed_sum}")
  print(f"Total tokens count: {tokens_sum}")


if __name__ == "__main__":
    main()