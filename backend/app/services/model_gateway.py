import json
from groq import Groq
import google.generativeai as genai
from app.config import settings

class ModelGateway:
    def __init__(self):
        # initialize Groq
        self.groq_client = Groq(api_key=settings.GROQ_API_KEY)

        # initialize Gemini
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.gemini_model = genai.GenerativeModel("gemini-1.5-flash")

        # models in priority order
        self.models = [
            {
                "provider": "groq",
                "model": "llama3-8b-8192",
                "label": "Groq LLaMA3 Primary"
            },
            {
                "provider": "groq",
                "model": "mixtral-8x7b-32768",
                "label": "Groq Mixtral Fallback"
            },
            {
                "provider": "gemini",
                "model": "gemini-1.5-flash",
                "label": "Gemini Flash Last Resort"
            }
        ]

    async def complete(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 1500
    ) -> str:
        last_error = None

        for model_config in self.models:
            try:
                print(f"🤖 Trying {model_config['label']}...")

                if model_config["provider"] == "groq":
                    response = self.groq_client.chat.completions.create(
                        model=model_config["model"],
                        messages=[{"role": "user", "content": prompt}],
                        temperature=temperature,
                        max_tokens=max_tokens
                    )
                    raw = response.choices[0].message.content

                elif model_config["provider"] == "gemini":
                    response = self.gemini_model.generate_content(prompt)
                    raw = response.text

                print(f"✅ Success with {model_config['label']}")
                return raw

            except Exception as e:
                print(f"❌ {model_config['label']} failed: {str(e)}")
                last_error = e
                continue

        raise Exception(f"All models failed. Last error: {str(last_error)}")

    def parse_json(self, raw: str) -> any:
        """
        Safely parse JSON from model response
        Handles markdown code blocks that models sometimes add
        """
        clean = raw.strip()
        if "```json" in clean:
            clean = clean.split("```json")[1].split("```")[0].strip()
        elif "```" in clean:
            clean = clean.split("```")[1].split("```")[0].strip()
        return json.loads(clean)

# single instance used across entire app
gateway = ModelGateway()