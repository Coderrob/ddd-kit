# Controlled Vocabulary

## Overview

This controlled vocabulary ensures consistent terminology usage across all process documentation. It follows library science principles for vocabulary control and provides authoritative definitions for key concepts in our SDLC framework.

## Core Terms

### Architecture & Design

| Term                                   | Definition                                                                        | Synonyms                            | Related Terms                                        |
| -------------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------- |
| **Interface-First Design**             | Architectural approach where contracts and APIs are defined before implementation | Contract-First, API-First           | Design by Contract, Specification-Driven Development |
| **Architecture Decision Record (ADR)** | Document capturing important architectural decisions and their rationale          | Design Decision, Technical Decision | Decision Log, Design Rationale                       |
| **Type System**                        | Formal method for categorizing and constraining data structures                   | Static Typing, Type Safety          | Data Modeling, Schema Definition                     |
| **Design Pattern**                     | Reusable solution template for common design problems                             | Architectural Pattern               | Best Practice, Solution Template                     |

### SDLC & Process

| Term                       | Definition                                                                  | Synonyms                    | Related Terms                            |
| -------------------------- | --------------------------------------------------------------------------- | --------------------------- | ---------------------------------------- |
| **Gate-Based Development** | Process where progression requires explicit approval at defined checkpoints | Stage-Gate, Milestone-Based | Quality Gate, Checkpoint Review          |
| **Human Review**           | Manual evaluation and approval by qualified personnel                       | Manual Review, Peer Review  | Code Review, Design Review               |
| **Phase**                  | Distinct stage in the development lifecycle with specific objectives        | Stage, Milestone            | Sprint, Iteration                        |
| **Traceability**           | Ability to track relationships and dependencies between artifacts           | Audit Trail, Linkage        | Requirements Traceability, Change Impact |

### Security & Compliance

| Term                | Definition                                                                  | Synonyms                            | Related Terms                                |
| ------------------- | --------------------------------------------------------------------------- | ----------------------------------- | -------------------------------------------- |
| **OWASP**           | Open Web Application Security Project - security standards organization     | -                                   | Security Framework, Vulnerability Management |
| **Threat Modeling** | Systematic approach to identifying and analyzing potential security threats | Risk Assessment                     | Security Analysis, Attack Vector Analysis    |
| **SAST**            | Static Application Security Testing - code analysis without execution       | Static Analysis                     | Code Review, Security Scanning               |
| **DAST**            | Dynamic Application Security Testing - runtime security testing             | Dynamic Analysis                    | Penetration Testing, Security Testing        |
| **GDPR**            | General Data Protection Regulation - EU privacy law                         | Data Protection Regulation          | Privacy Law, Data Governance                 |
| **SOC2**            | Service Organization Control 2 - security and compliance framework          | SOC 2, Service Organization Control | Compliance Framework, Audit Standard         |

### Testing & Quality

| Term                                   | Definition                                                  | Synonyms                              | Related Terms                         |
| -------------------------------------- | ----------------------------------------------------------- | ------------------------------------- | ------------------------------------- |
| **TDD**                                | Test-Driven Development - write tests before implementation | Test-First Development                | BDD, ATDD                             |
| **Fuzz Testing**                       | Automated testing with random or malformed inputs           | Fuzzing                               | Property-Based Testing, Chaos Testing |
| **Performance Testing**                | Evaluation of system performance under various conditions   | Load Testing, Stress Testing          | Benchmarking, Capacity Testing        |
| **Non-Functional Requirements (NFRs)** | System qualities like performance, security, usability      | Quality Attributes, System Properties | Service Level Requirements            |

### Operations & Monitoring

| Term                  | Definition                                                        | Synonyms              | Related Terms                             |
| --------------------- | ----------------------------------------------------------------- | --------------------- | ----------------------------------------- |
| **SLA**               | Service Level Agreement - contractual performance commitments     | Service Agreement     | SLO, Performance Contract                 |
| **SLO**               | Service Level Objective - specific measurable performance targets | Service Objective     | KPI, Performance Metric                   |
| **Observability**     | System's ability to be monitored and understood through outputs   | Monitoring, Telemetry | Instrumentation, Diagnostics              |
| **Canary Deployment** | Gradual rollout strategy using small user subset                  | Canary Release        | Blue-Green Deployment, Rolling Deployment |
| **Rollback**          | Reverting to previous system version due to issues                | Revert, Backout       | Recovery, Restore                         |

### Governance & Management

| Term            | Definition                                                                       | Synonyms                               | Related Terms                            |
| --------------- | -------------------------------------------------------------------------------- | -------------------------------------- | ---------------------------------------- |
| **RACI Matrix** | Responsibility assignment matrix (Responsible, Accountable, Consulted, Informed) | Responsibility Matrix                  | Accountability Chart, Role Definition    |
| **CAB**         | Change Advisory Board - group that evaluates and approves changes                | Change Board                           | Change Control Board, Steering Committee |
| **Deprecation** | Planned obsolescence and removal of features or systems                          | Sunset, End-of-Life                    | Legacy Management, Retirement            |
| **DR/BCP**      | Disaster Recovery/Business Continuity Planning                                   | Disaster Recovery, Business Continuity | Contingency Planning, Crisis Management  |

### Data & Lifecycle

| Term                  | Definition                                                        | Synonyms                  | Related Terms                          |
| --------------------- | ----------------------------------------------------------------- | ------------------------- | -------------------------------------- |
| **Data Lifecycle**    | Complete journey of data from creation to destruction             | Data Management Lifecycle | Data Governance, Information Lifecycle |
| **Retention Policy**  | Rules governing how long data is kept and when it's deleted       | Data Retention            | Archival Policy, Data Disposal         |
| **Vendor Management** | Process of managing relationships with external service providers | Supplier Management       | Third-Party Risk, Vendor Risk          |
| **OSS**               | Open Source Software - publicly available source code             | Open Source, FOSS         | Free Software, Community Software      |

### Accessibility & Internationalization

| Term     | Definition                                                     | Synonyms                 | Related Terms                      |
| -------- | -------------------------------------------------------------- | ------------------------ | ---------------------------------- |
| **I18n** | Internationalization - designing software for multiple locales | Internationalization     | Localization (L10n), Globalization |
| **A11y** | Accessibility - designing for users with disabilities          | Accessibility            | Universal Design, Inclusive Design |
| **WCAG** | Web Content Accessibility Guidelines                           | Accessibility Guidelines | Accessibility Standards            |

### Emerging Technology

| Term               | Definition                                                        | Synonyms                | Related Terms                           |
| ------------------ | ----------------------------------------------------------------- | ----------------------- | --------------------------------------- |
| **AI Model Risk**  | Risks associated with deploying artificial intelligence models    | ML Risk, Algorithm Risk | Model Governance, AI Ethics             |
| **Model Drift**    | Degradation of AI model performance over time                     | Concept Drift           | Model Decay, Performance Degradation    |
| **Explainable AI** | AI systems that provide understandable explanations for decisions | XAI, Interpretable AI   | AI Transparency, Model Interpretability |

## Usage Guidelines

1. **Consistency**: Always use the preferred term from this vocabulary
2. **Context**: Consider the audience when choosing between technical and business terms
3. **Updates**: Request vocabulary additions through the standard change process
4. **Cross-References**: Link to vocabulary entries in documentation

## Maintenance

- **Review Cycle**: Quarterly vocabulary reviews
- **Change Process**: All additions/changes require CAB approval
- **Version Control**: Track vocabulary changes with semantic versioning
- **Stakeholder Input**: Regular feedback collection from document authors
