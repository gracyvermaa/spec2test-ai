
# Spec2Test AI — Architecture

## System Overview

```mermaid
flowchart TD
    A["User"] --> B["Submit Requirements"]
    B --> C["React Frontend"]
    C --> D["FastAPI Backend"]
    D --> E["LangGraph AI Workflow"]
    E --> F["Requirement Analysis"]
    F --> G["Test Case Generation"]
    G --> H["Risk and Edge Case Analysis"]
    H --> I["Human Review"]
    I --> J["Test Execution"]
    J --> K["Bug Reports"]
    D <--> L[("PostgreSQL Database")]
```

## Technology Layers

```mermaid
flowchart TB
    A["Frontend - React"]
    B["Backend - Python / FastAPI"]
    C["AI Orchestration - LangGraph"]
    D["Database - PostgreSQL"]
    E["Testing - Pytest / Playwright"]

    A --> B
    B --> C
    B <--> D
    B --> E
```

## Multi-Agent Workflow

```mermaid
flowchart TD
    A["Software Requirements"] --> B["Requirement Analyst"]
    B --> C["Test Case Generator"]
    C --> D["Risk Assessment Agent"]
    D --> E["Human QA Review"]
    E --> F["Approved Test Cases"]
    F --> G["Test Execution"]
    G --> H["Test Reports"]
```

*Note: This is the planned architecture, not an implemented system.*

## Architecture Visuals

### System Architecture
![System Architecture](diagrams/system-architecture.png)

### Multi-Agent Architecture
![Multi-Agent Architecture](diagrams/multi-agent-architecture.png)

### Requirement Data Flow
![Requirement Data Flow](diagrams/data-flow-architecture.png)
