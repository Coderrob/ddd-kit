# Metadata System

## Overview

This metadata system provides a library science-based approach to organizing and categorizing process documentation. It ensures consistent classification, enables efficient discovery, and supports traceability across the entire SDLC framework.

## Classification Schema

### Document Types

- **Process**: Step-by-step procedures
- **Policy**: Governing principles and rules
- **Standard**: Technical specifications and requirements
- **Guideline**: Recommended practices
- **Template**: Reusable document frameworks
- **Checklist**: Verification and validation lists
- **Reference**: Supporting materials and links

### Subject Areas

- **Architecture**: System design and patterns
- **Security**: Information security practices
- **Compliance**: Regulatory and standards adherence
- **Quality**: Testing and validation
- **Operations**: Runtime management
- **Governance**: Decision-making processes
- **Lifecycle**: Development phases and gates

### Audience Levels

- **Strategic**: Executive and management
- **Tactical**: Team leads and architects
- **Operational**: Individual contributors
- **Cross-functional**: Multi-role applicability

### Maturity Levels

- **Initial**: Basic implementation
- **Developing**: Partial adoption
- **Defined**: Fully documented
- **Managed**: Measured and controlled
- **Optimizing**: Continuously improving

## Metadata Fields

Each document must include the following metadata in its frontmatter:

```yaml
---
document_type: [Process|Policy|Standard|Guideline|Template|Checklist|Reference]
subject_area: [Architecture|Security|Compliance|Quality|Operations|Governance|Lifecycle]
audience_level: [Strategic|Tactical|Operational|Cross-functional]
maturity_level: [Initial|Developing|Defined|Managed|Optimizing]
version: 'x.y.z'
created_date: 'YYYY-MM-DD'
last_updated: 'YYYY-MM-DD'
review_cycle: [quarterly|semi-annual|annual]
next_review: 'YYYY-MM-DD'
owner: 'Role/Team responsible'
reviewers: ['List of required reviewers']
related_documents: ['List of related document IDs']
tags: ['keyword1', 'keyword2', 'keyword3']
traceability_id: 'unique-identifier'
---
```

## Traceability System

### Document Identifiers

Format: `{area}-{type}-{sequence}`
Examples:

- `SEC-POL-001`: Security Policy #1
- `ARCH-STD-005`: Architecture Standard #5
- `QUAL-CHK-012`: Quality Checklist #12

### Relationship Types

- **depends_on**: Prerequisites required
- **supports**: Documents this one enables
- **supersedes**: Previous versions replaced
- **references**: External dependencies
- **implements**: Standards or policies enacted

## Usage Guidelines

1. **Mandatory Fields**: All documents must include document_type, subject_area, version, and traceability_id
2. **Consistent Tagging**: Use controlled vocabulary terms (see ../vocabulary/)
3. **Regular Reviews**: Maintain review schedules based on criticality
4. **Version Control**: Follow semantic versioning for all changes
5. **Cross-References**: Link related documents for navigation

## Quality Assurance

- Metadata validation occurs during PR review process
- Automated checks verify required fields presence
- Consistency reports generated monthly
- Link validation performed during builds

## Tools and Automation

- Metadata extraction scripts available in `/tools/`
- Automated cross-reference validation
- Reporting dashboards for compliance tracking
- Integration with change management processes
