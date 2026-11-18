# Spec2Test AI — Architecture

## System Overview

```mermaid
flowchart TD
    A["?? User"] --> B["?? Submit Requirements"]
    B --> C["?? React Frontend"]
    C --> D["?? FastAPI Backend"]
    D --> E["?? LangGraph AI Workflow"]
    E --> F["?? Requirement Analysis"]
    F --> G["?? Test Case Generation"]
    G --> H["?? Risk & Edge Case Analysis"]
    H --> I["????? Human Review"]
    I --> J["? Test Execution"]
    J --> K["?? Bug Reports"]
    D <--> L[("??? PostgreSQL Database")]
```

## Technology Layers

```mermaid
flowchart TB
    A["Frontend — React"]
    B["Backend — Python / FastAPI"]
    C["AI Orchestration — LangGraph"]
    D["Database — PostgreSQL"]
    E["Testing — Pytest / Playwright"]

    A --> B
    B --> C
    B <--> D
    B --> E
```

*Note: This is the planned architecture, not an implemented system.*
