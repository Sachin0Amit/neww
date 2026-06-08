# Hayhooks + Itinerary Agent + Open WebUI

An AI-powered travel itinerary planning system that combines **Hayhooks** (Haystack AI pipeline serving), a multi-agent itinerary planning system, and **Open WebUI** for a chat interface.

## Features

- **Multi-agent architecture**: specialized agents for different aspects of travel planning
- **Real-time data**: live data from Google Maps, route optimization, and Perplexity
- **Hierarchical planning**: from macro route planning to detailed daily itineraries
- **Accommodation optimization**: strategic lodging placement for multi-day trips
- **Chat interface**: Open WebUI for natural-language interaction
- **Containerized**: one `docker compose up` to run the whole stack locally

## Architecture

### Core agents

1. **Macro Itinerary Agent** (`self.agent`)
   - Main orchestrator for multi-day travel planning
   - Establishes macro routes and coordinates the other agents
2. **Day Itinerary Agent** (`day_itinerary_agent`)
   - Creates detailed single-day itineraries
   - Tool name: `daily_itinerary_planning_agent`
3. **Lodging Agent** (`lodging_itinerary_agent`)
   - Determines optimal accommodation placement across the route
   - Tool name: `accommodation_strategy_optimizer`

### External integrations

- **Google Maps API** — place search, details, location data
- **Optimal Route service** — multi-destination route optimization
- **Perplexity API** — real-time research and local insights

## Quick start

### Prerequisites

- Docker and Docker Compose
- API keys for Google Maps, Perplexity, and OpenAI

### 1. Configure environment variables

Copy the example and fill in your keys:

```bash
cp .env.example .env
```

Required:

```env
HAYHOOKS_PIPELINES_DIR=/pipelines
HAYHOOKS_SHOW_TRACEBACKS=true
GOOGLE_MAPS_API_KEY=your_google_maps_api_key   # used by google-maps and optimal-route
PERPLEXITY_API_KEY=your_perplexity_api_key
OPENAI_API_KEY=your_openai_api_key
```

Optional — enable Langfuse tracing of the Haystack pipeline:

```env
HAYSTACK_CONTENT_TRACING_ENABLED=true
LANGFUSE_SECRET_KEY=your_langfuse_secret_key
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
LANGFUSE_HOST=https://cloud.langfuse.com
```

### 2. Start the stack

```bash
docker compose up -d --build
```

### 3. Open the UI

Navigate to <http://localhost:3000>.

Auth is disabled by default for local use — you'll go straight to the chat.

### 4. Logs / status

```bash
docker compose logs -f
docker compose ps
```

### 5. Stop

```bash
docker compose down
```

## Usage

Start a new chat and describe your trip, for example:

```text
Plan a 5-day trip to Italy focusing on art and cuisine.
I prefer boutique hotels, have a moderate budget, and will be traveling by train.
I want to visit Rome, Florence, and Venice.
```

## Project structure

```text
.
├── pipelines/
│   └── itinerary_agent/
│       ├── pipeline_wrapper.py                 # Multi-agent orchestration
│       ├── macro_itinerary_system_prompt.txt
│       ├── day_itinerary_system_prompt.txt
│       └── lodging_itinerary_system_prompt.txt
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── README.md
```

## Services

| Service        | Purpose                          | Network port    |
|----------------|----------------------------------|-----------------|
| `open-webui`   | Chat interface                   | 3000 (host)     |
| `hayhooks`     | Haystack pipeline server         | 1416 (internal) |
| `google-maps`  | Google Maps MCP server           | 8100 (internal) |
| `optimal-route`| Route optimization MCP server    | 8080 (internal) |
| `perplexity`   | Perplexity MCP server            | 8080 (internal) |

Only `open-webui` is exposed on the host. The other services communicate over the Docker network.

## Configuration

### Model

The system uses OpenAI's `gpt-4.1` by default. To change it, edit the `llm` in [pipelines/itinerary_agent/pipeline_wrapper.py](pipelines/itinerary_agent/pipeline_wrapper.py):

```python
llm = OpenAIChatGenerator(model="o4-mini")  # or your preferred model
```

### Adding new tools

1. Define the MCP toolset in `pipeline_wrapper.py`
2. Add the tools to the appropriate agent(s)
3. Update the relevant system prompt
4. Rebuild: `docker compose up -d --build`

### Input validation

`pipeline_wrapper.py` includes a lightweight policy-compliance agent that rejects requests over 10 days / 7 locations or that look like prompt-injection attempts. Remove or relax it in `load_validation_system_message()` if you don't need it.
