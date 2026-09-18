# `@hulla/*` documentation page models

Use the smallest model that fits the page. These structures adapt the useful patterns observed in Turso's introduction, quickstart, and feature guides: a concise promise, path selection, visible outcomes, mechanism before configuration, and explicit constraints.

## Introduction

1. One-sentence product promise.
2. Concrete evaluation scenarios, integrated into the opener when they clarify who the package is for. Do not force a repeated “Use this when” heading or panel.
3. Choose-a-path comparison for major package layers.
4. Plain-language mental model.
5. Recommended reading order.

## Quickstart

1. Define the finished outcome and prerequisites.
2. List the steps the reader will complete.
3. Use numbered, outcome-named steps.
4. Explain why each command or code fragment exists before showing it.
5. Show a success signal after each meaningful stage.
6. Link to the next conceptual page once the result works.

Commit to one architecture through the success signal. A quickstart must not replace its client,
transport, host, or implementation strategy halfway through the guide. Keep the example domain
familiar and move incidental validation or business rules to later concept pages.

## Concept

1. Name the problem the concept resolves.
2. Explain the concept with a small concrete example or relationship.
3. Describe how it works as a short sequence.
4. Contrast it with the nearest alternative.
5. State invariants and common mistakes.

When the concept has stages, render a compact flow from declaration to execution to observable result. The visual must supplement the explanation, not replace it.

## Task guide

1. State who needs the task and the final result.
2. List prerequisites and where each file belongs.
3. Walk through steps in execution order.
4. Explain the effect of each step and how to verify it.
5. Cover the two or three choices that materially change the implementation.
6. End with production constraints or troubleshooting.

## Integration

1. Explain what the integration adds beyond the base package.
2. State which side owns data, transport, caching, or lifecycle.
3. Show the minimum installation and registration path.
4. Demonstrate the first useful consumer call.
5. Explain cache keys, errors, cancellation, or synchronization only where relevant.
6. State what the integration deliberately does not manage.

## Reference

1. State the scope and intended lookup task.
2. Group entries by responsibility, not export alphabet.
3. Use tables or compact lists with exact defaults and constraints.
4. Link to task or concept pages for explanation.
5. Keep release provenance in build metadata, not the page hero.

## Code example contract

Every example must make these facts discoverable in nearby prose:

- File or runtime context.
- Required imports or setup.
- Inputs and resulting behavior.
- Reason for the selected API.
- Boundary crossed: in-process, HTTP, generation, framework, or storage.
- The later call or consumer that uses the declared value.

Use two-space indentation. Keep the first example free of optional plugins, custom converters, opaque metadata, and advanced generic types unless those are the page topic.

Establish a working example once. When a later section improves or changes it, prefer a small
insert/delete diff over another complete copy. Name the consequence after the diff so the reader
knows whether the change affects client input, handler input, runtime validation, wire data, or
ownership.

For a block longer than roughly 15 lines, split it or focus the few lines that prove the surrounding
point. A long integration example may remain copy-ready, but the mount and first observable call
must be visually discoverable. Do not use highlighting as decoration or mark most of a block.
