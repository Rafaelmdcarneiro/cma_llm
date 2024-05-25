#!/bin/bash

set -euo pipefail


cd llama.cpp/

# MODEL_PATH=/data/LLMs/models--TheBloke--Mixtral-8x7B-Instruct-v0.1-GGUF/mixtral-8x7b-instruct-v0.1.Q5_K_M.gguf
# MODEL_PATH=/data/LLMs/models--TheBloke--Llama-2-7B-Chat-GGUF/llama-2-7b-chat.Q4_K_M.gguf

MODEL_PATH=/data/LLMs/models--TheBloke--Mixtral-8x7B-Instruct-v0.1-GGUF/mixtral-8x7b-instruct-v0.1.Q5_K_M.gguf
# MODEL_PATH=/data/LLMs/Llama-3-8B-GGUF/Meta-Llama-3-8B-Instruct.Q8_0.gguf

BATCH_SIZE=8192
UBATCH_SIZE=4096
N_GPU_LAYERS=100
CONTEXT_SIZE=8192
CHAT_TEMPLATE=llama2
SYSTEM_PROMPT_FILE=../system_prompt_default.json
LOG_FORMAT=text
TOKENS_TO_PREDICT=8192

./server --model $MODEL_PATH --batch-size $BATCH_SIZE --ubatch-size $UBATCH_SIZE --n-gpu-layers $N_GPU_LAYERS --ctx-size $CONTEXT_SIZE --chat-template $CHAT_TEMPLATE --system-prompt-file $SYSTEM_PROMPT_FILE --log-format $LOG_FORMAT --n-predict $TOKENS_TO_PREDICT