import os
from openai import AsyncOpenAI
from agents import (
    Agent,
    Runner,
    set_default_openai_api,
    set_default_openai_client,
    set_tracing_disabled,
)

# === Configuration ===
BASE_URL = "https://api.novita.ai/v3/openai"
API_KEY = "sk_Y5Ts5IQs3XmuCBaIwTRm_VYPsFW9wmcByaIRFql31Ew"
MODEL_NAME = "qwen/qwen3-0.6b-fp8"  # Cheapest model

# === Setup ===
set_default_openai_api("chat_completions")
set_default_openai_client(AsyncOpenAI(base_url=BASE_URL, api_key=API_KEY))
set_tracing_disabled(disabled=True)

agent = Agent(
    name="CheapAssistant",
    instructions="You are a helpful assistant.",
    model=MODEL_NAME,
)

# === CLI App ===
def main():
    print("Welcome to Novita AI (Cheap Model Chat)")
    while True:
        user_input = input("\nYou: ")
        if user_input.lower() in ["exit", "quit"]:
            print("Goodbye!")
            break

        result = Runner.run_sync(agent, user_input)
        print("AI:", result.final_output)

if __name__ == "__main__":
    main()
