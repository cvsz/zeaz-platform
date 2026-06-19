---
name: zai-research
description: Master skill combining related sub-skills
---

# zai-research
## Sub-skill: scientific-db-pubmed-database

# PubMed Database

Use this skill when a task needs biomedical literature from PubMed rather than
general web search.

## When to Use

- Searching MEDLINE or life-sciences literature.
- Building PubMed queries with MeSH terms, field tags, dates, or article types.
- Looking up PMIDs, abstracts, publication metadata, or related citations.
- Running systematic-review search passes that need repeatable search strings.
- Using NCBI E-utilities directly from Python, shell, or another HTTP client.

## Query Construction

Start with the research question, split it into concepts, then combine concepts
with Boolean operators.

```text
concept_1 AND concept_2 AND filter
synonym_a OR synonym_b
NOT exclusion_term
```

Useful PubMed field tags:

- `[ti]`: title
- `[ab]`: abstract
- `[tiab]`: title or abstract
- `[au]`: author
- `[ta]`: journal title abbreviation
- `[mh]`: MeSH term
- `[majr]`: major MeSH topic
- `[pt]`: publication type
- `[dp]`: date of publication
- `[la]`: language

Examples:

```text
diabetes mellitus[mh] AND treatment[tiab] AND systematic review[pt] AND 2023:2026[dp]
(metformin[nm] OR insulin[nm]) AND diabetes mellitus, type 2[mh] AND randomized controlled trial[pt]
smith ja[au] AND cancer[tiab] AND 2026[dp] AND english[la]
```

## MeSH and Subheadings

Prefer MeSH when the concept has a stable controlled-vocabulary term. Combine
MeSH with title/abstract terms when the topic is new or terminology varies.

Correct subheading syntax puts the subheading before the field tag:

```text
diabetes mellitus, type 2/drug therapy[mh]
cardiovascular diseases/prevention & control[mh]
```

Use `[majr]` only when the topic must be central to the paper. It can improve
precision but may miss relevant work.

## Filters

Publication types:

- `clinical trial[pt]`
- `meta-analysis[pt]`
- `randomized controlled trial[pt]`
- `review[pt]`
- `systematic review[pt]`
- `guideline[pt]`

Date filters:

```text
2026[dp]
2020:2026[dp]
2026/03/15[dp]
```

Availability filters:

```text
free full text[sb]
hasabstract[text]
```

## E-utilities Workflow

NCBI E-utilities supports repeatable API workflows:

1. `esearch.fcgi`: search and return PMIDs.
2. `esummary.fcgi`: return lightweight article metadata.
3. `efetch.fcgi`: fetch abstracts or full records in XML, MEDLINE, or text.
4. `elink.fcgi`: find related articles and linked resources.

Use an email and API key for production scripts. Store API keys in environment
variables, never in committed files or command history.

```python
import os
import time
import requests

BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"


def esearch(query: str, retmax: int = 20) -> list[str]:
    params = {
        "db": "pubmed",
        "term": query,
        "retmode": "json",
        "retmax": retmax,
        "tool": "ecc-pubmed-search",
        "email": os.environ.get("NCBI_EMAIL", ""),
    }
    api_key = os.environ.get("NCBI_API_KEY")
    if api_key:
        params["api_key"] = api_key

    response = requests.get(f"{BASE}/esearch.fcgi", params=params, timeout=30)
    response.raise_for_status()
    time.sleep(0.35)
    return response.json()["esearchresult"]["idlist"]


pmids = esearch("hypertension[mh] AND randomized controlled trial[pt] AND 2024:2026[dp]")
print(pmids)
```

For batches, prefer NCBI history server parameters (`usehistory=y`,
`WebEnv`, `query_key`) instead of passing very long PMID lists through URLs.

## Output Discipline

For each search pass, record:

- exact search string
- database searched
- date searched
- filters used
- result count
- export format
- any manual exclusions

Example:

```markdown
| Database | Date searched | Query | Filters | Results |
| --- | --- | --- | --- | ---: |
| PubMed | 2026-05-11 | `sickle cell disease[mh] AND CRISPR[tiab]` | 2020:2026[dp], English | 42 |
```

## Review Checklist

- Are field tags valid PubMed tags?
- Are MeSH terms paired with free-text synonyms for newer topics?
- Is the date range explicit and appropriate?
- Does the search log include enough detail to reproduce the query?
- Are API keys loaded from the environment?
- Does HTTP code call `raise_for_status()` or otherwise handle non-200
  responses before parsing?
- Are rate limits respected?

## References

- [PubMed help](https://pubmed.ncbi.nlm.nih.gov/help/)
- [NCBI E-utilities documentation](https://www.ncbi.nlm.nih.gov/books/NBK25501/)
- [NCBI API key guidance](https://support.nlm.nih.gov/kbArticle/?pn=KA-05317)
- NCBI support: <eutilities@ncbi.nlm.nih.gov>


## Sub-skill: scientific-db-uspto-database

# USPTO Database

Use this skill when a task needs official United States patent or trademark
records from USPTO systems.

## When to Use

- Searching granted patents or pre-grant publications.
- Checking patent application status, file-wrapper data, assignments, or
  public prosecution history.
- Looking up trademark status, documents, or assignment history.
- Building reproducible prior-art, portfolio, or IP landscape research logs.
- Comparing USPTO records with secondary tools such as Google Patents,
  Lens.org, Semantic Scholar, or company patent pages.

Do not use this skill to give legal advice. Treat it as a data-gathering and
record-verification workflow.

## Source Selection

Prefer official USPTO or USPTO-supported surfaces first:

- Open Data Portal (ODP): current home for migrated USPTO datasets and APIs.
- Patent File Wrapper: public patent application bibliographic data and file
  wrapper records.
- PatentSearch API: PatentsView search API for granted patents and pre-grant
  publication datasets.
- TSDR Data API: trademark status and document retrieval.
- Patent and Trademark Assignment Search: ownership transfer records.
- PTAB data in ODP: Patent Trial and Appeal Board proceedings.

Use secondary sources only as convenience indexes. When the answer matters,
cross-check the official record.

## Authentication and Secrets

Many USPTO API flows require an API key. Store keys in environment variables or
a secret manager, never in committed files or pasted transcripts.

Common environment names:

```bash
export USPTO_API_KEY="..."
export PATENTSVIEW_API_KEY="..."
```

For PatentSearch, send the key with the `X-Api-Key` header. For TSDR, follow
the current USPTO API Manager instructions and rate-limit guidance.

## PatentSearch Workflow

Use PatentSearch for broad patent and pre-grant publication search when the
question is about trends, inventors, assignees, classifications, dates, or
portfolio slices.

Workflow:

1. Identify the endpoint from the current PatentSearch reference or Swagger UI.
2. Build a JSON query with explicit filters.
3. Request only the fields needed for the analysis.
4. Sort and paginate deterministically.
5. Record the endpoint, query body, date, data currency note, and result count.

Python request skeleton:

```python
import os
import requests

API_KEY = os.environ["PATENTSVIEW_API_KEY"]
BASE = "https://search.patentsview.org/api/v1"

payload = {
    "q": {
        "_and": [
            {"patent_date": {"_gte": "2024-01-01"}},
            {"assignees.assignee_organization": {"_text_any": ["Google", "Alphabet"]}},
        ]
    },
    "f": ["patent_id", "patent_title", "patent_date"],
    "s": [{"patent_date": "desc"}],
    "o": {"per_page": 100, "page": 1},
}

response = requests.post(
    f"{BASE}/patent/",
    headers={"X-Api-Key": API_KEY, "Content-Type": "application/json"},
    json=payload,
    timeout=30,
)
response.raise_for_status()
print(response.json())
```

Before reusing a query, verify current endpoint names, field paths, request
parameters, and API-key availability in the live PatentSearch docs.

## Trademark/TSDR Workflow

Use TSDR when the task needs trademark case status, documents, images, owner
history, or prosecution events.

Workflow:

1. Normalize the serial number or registration number.
2. Check the current TSDR API instructions and required API-key header.
3. Fetch status first, then documents only if needed.
4. Respect the lower rate limit for PDF, ZIP, and multi-case downloads.
5. Capture retrieval date and serial/registration identifier in the output.

For large trademark pulls, prefer documented bulk-data flows rather than
screen-scraping public pages.

## File Wrapper and Prosecution History

For application status, transaction history, and prosecution documents:

- Start with ODP Patent File Wrapper search.
- Use exact identifiers when available: application number, publication number,
  patent number, or party name.
- Record whether the record is a granted patent, pre-grant publication, or
  pending application.
- Cross-check document dates and status against the record detail page before
  citing them.

## Assignment Workflow

For patent or trademark ownership:

1. Search official assignment data by patent/application/registration number,
   assignor, assignee, or reel/frame when available.
2. Record conveyance text, execution date, recordation date, and parties.
3. Distinguish assignment records from current legal ownership conclusions.
4. If ownership is material, flag the result for attorney or subject-matter
   review.

## Reproducible Output

Every USPTO research pass should include a log table:

```markdown
| Source | Date searched | Identifier/query | Filters | Results | Notes |
| --- | --- | --- | --- | ---: | --- |
| PatentSearch | 2026-05-11 | `assignee=Alphabet AND date>=2024` | patent endpoint | 118 | API docs checked before run |
| TSDR | 2026-05-11 | `serial=90000000` | status only | 1 | API-key flow, no document bulk pull |
```

For final writeups, separate:

- official record facts
- inferred analysis
- secondary-source convenience matches
- unresolved gaps or records that require legal review

## Review Checklist

- Did you use an official USPTO or USPTO-supported source first?
- Did you verify current endpoint and field names before running code?
- Are API keys kept out of files, shell history, and output logs?
- Does the query log include the date searched and exact request shape?
- Are rate limits respected?
- Are legal conclusions avoided or explicitly escalated?
- Are secondary sources labeled as secondary?

## References

- [USPTO APIs catalog](https://developer.uspto.gov/api-catalog)
- [USPTO Open Data Portal](https://data.uspto.gov/)
- [PatentSearch API reference](https://search.patentsview.org/docs/docs/Search%20API/SearchAPIReference/)
- [PatentSearch API updates](https://search.patentsview.org/docs/)
- [TSDR API bulk download FAQ](https://developer.uspto.gov/faq/tsdr-api-bulk-download)


## Sub-skill: scientific-pkg-gget

# gget

Use this skill when a task needs quick bioinformatics lookup across genomic
reference databases with the `gget` CLI or Python package.

## When to Use

- Finding Ensembl IDs, gene metadata, transcript details, or sequences.
- Running quick BLAST or BLAT lookups without building a full local pipeline.
- Fetching reference genome links and annotations from Ensembl.
- Querying protein structure, pathway, cancer, expression, or disease-association
  modules through a single interface.
- Creating a reproducible first-pass evidence log before moving to heavier
  tools such as Biopython, Snakemake, Nextflow, BLAST+, or database-specific
  clients.

Use a dedicated workflow instead of `gget` when the task requires regulated
clinical interpretation, high-throughput production pipelines, or fine-grained
control over database versions and local indexes.

## Installation

Use a clean Python environment.

```bash
python -m venv .venv
. .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install --upgrade gget
gget --help
```

If `uv` is available:

```bash
uv venv
. .venv/bin/activate
uv pip install gget
```

Before relying on an older environment, upgrade `gget` and re-check the module
docs. The upstream databases queried by `gget` change over time.

## Basic Patterns

CLI shape:

```bash
gget <module> [arguments] [options]
```

Python shape:

```python
import gget

result = gget.search(["BRCA1"], species="human")
print(result)
```

Common workflow:

1. Identify the species, assembly, gene ID type, and database needed.
2. Check the current module documentation for arguments.
3. Run a small query first.
4. Save output with an explicit filename and date.
5. Record module name, version, arguments, and database assumptions.

## Common Modules

Use current upstream docs for exact arguments. These modules are common first
choices:

- `gget search`: find Ensembl IDs from search terms.
- `gget info`: retrieve metadata for Ensembl, UniProt, or related IDs.
- `gget seq`: fetch nucleotide or amino-acid sequences.
- `gget ref`: retrieve reference genome download links.
- `gget blast`: run a quick BLAST query.
- `gget blat`: locate a sequence against supported genome assemblies.
- `gget muscle`: run multiple sequence alignment.
- `gget diamond`: run local sequence alignment against reference sequences.
- `gget alphafold` and `gget pdb`: inspect protein-structure references.
- `gget enrichr`, `gget opentargets`, `gget archs4`, `gget bgee`, `gget cbio`,
  and `gget cosmic`: explore enrichment, target, expression, cancer, and disease
  association data.

Do not assume every module supports every Python version or dependency set.
Some optional scientific dependencies have narrower version support than the
core package.

## Quick Examples

Find genes:

```bash
gget search -s human brca1 dna repair -o brca1-search.json
```

Fetch gene metadata:

```bash
gget info ENSG00000012048 -o brca1-info.json
```

Fetch a sequence:

```bash
gget seq ENSG00000012048 -o brca1-seq.fa
```

Run a small BLAST query:

```bash
gget blast "MEEPQSDPSVEPPLSQETFSDLWKLLPEN" -l 10 -o blast-results.json
```

Python example:

```python
import gget

genes = gget.search(["BRCA1", "DNA repair"], species="human")
info = gget.info(["ENSG00000012048"])
sequence = gget.seq("ENSG00000012048")
```

## Reproducibility Log

For scientific outputs, include enough metadata to replay the query.

```markdown
| Date | gget version | Module | Query | Species/assembly | Output | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-05-11 | `gget --version` | search | `BRCA1 DNA repair` | human | `brca1-search.json` | Docs checked before run |
```

Also record:

- Python version and environment manager.
- Any optional dependency installed through `gget setup`.
- Database-specific identifiers returned by the query.
- Whether output is JSON, CSV, FASTA, or a DataFrame export.
- Any failures that were resolved by upgrading `gget`.

## Review Checklist

- Did you upgrade or verify the installed `gget` version?
- Did you check the current upstream module docs before using arguments?
- Is the species or assembly explicit?
- Are identifiers preserved exactly, including Ensembl/UniProt prefixes?
- Is the result labeled as database output rather than clinical interpretation?
- Is the query reproducible from the saved command or Python snippet?
- Are optional dependencies installed in an isolated environment?

## References

- [gget documentation](https://pachterlab.github.io/gget/)
- [gget updates](https://pachterlab.github.io/gget/en/updates.html)
- [gget GitHub repository](https://github.com/pachterlab/gget)
- [gget Bioinformatics paper](https://doi.org/10.1093/bioinformatics/btac836)


## Sub-skill: scientific-thinking-literature-review

# Literature Review

Use this skill when the task is to find, screen, synthesize, and cite a body of
academic or technical literature.

## When to Use

- Building a systematic, scoping, or narrative literature review.
- Synthesizing the state of the art for a research question.
- Finding gaps, contradictions, or future-work directions.
- Preparing citation-backed background sections for papers or reports.
- Comparing evidence across peer-reviewed papers, preprints, patents, and
  technical reports.

## Review Types

- **Narrative review**: broad synthesis; useful for orientation.
- **Scoping review**: maps concepts, methods, and evidence gaps.
- **Systematic review**: predefined protocol, reproducible search, explicit
  screening and exclusion.
- **Meta-analysis**: systematic review plus quantitative effect aggregation.

Ask the user which level of rigor is needed. If unspecified, default to a
scoping review for exploratory work and a systematic review for publication or
clinical claims.


## ZeaZ Platform & apps/* Monorepo Rules
When implementing tasks on the `zeaz-platform` repository, you MUST strictly enforce these architecture and workflow rules:
1. **Monorepo Architecture (apps/*)**: The platform is a unified monorepo. ALL applications, microservices, frontends, and AI toolings (e.g., zLinebot, zwallet, zdash) reside inside the `apps/` directory. Do not create top-level directories for apps. When refactoring or adding features, always scope your work to the specific `apps/<app-name>/` folder.
2. **Environment Variables**: Avoid scattering `.env` files. Consolidate environment variables into a central `.env.example` inside the respective app folder. Canonical Cloudflare variables (e.g. `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`) MUST be used instead of legacy `CF_` variants.
3. **Commit Workflow**: NEVER use `git commit` or `git push` directly. ALWAYS stage your intended files with `git add` and commit using `make gpg-finalize COMMIT_MSG="..."` from the repository root to ensure all GitOps and DevSecOps checks pass.
4. **Security**: NEVER commit or generate real secrets. Unsafe placeholders like `replace-me`, `changeme`, `dummy-secret` are FORBIDDEN.
5. **Language**: Code, documentation, and technical definitions MUST be in English.

## Workflow

### 1. Define the Question

Convert the prompt into a searchable research question.

For clinical or biomedical work, use PICO:

- Population
- Intervention or exposure
- Comparator
- Outcome

For technical work, use:

- system or domain
- method or intervention
- comparison baseline
- evaluation metric

### 2. Plan the Search

Create a search protocol before collecting sources:

- databases to search
- date range
- languages
- publication types
- inclusion criteria
- exclusion criteria
- exact search strings

Minimum useful database set:

- PubMed for biomedical and life-sciences literature.
- arXiv for CS, math, physics, quantitative biology, and preprints.
- Semantic Scholar or Crossref for broad academic discovery.
- Domain-specific sources when relevant, such as clinical-trial registries,
  patent databases, standards bodies, or official technical docs.

### 3. Search and Log Evidence

Keep a search log that makes the review reproducible:

```markdown
| Database | Date searched | Query | Filters | Results | Export |
| --- | --- | --- | --- | ---: | --- |
| PubMed | 2026-05-11 | `("CRISPR"[tiab] OR "Cas9"[tiab]) AND "sickle cell"[tiab]` | 2020:2026, English | 86 | PMID list |
| arXiv | 2026-05-11 | `CRISPR sickle cell gene editing` | q-bio, 2020:2026 | 9 | BibTeX |
```

Save raw IDs, URLs, DOIs, abstracts, and notes separately from the final prose.

### 4. Deduplicate

Deduplicate in this order:

1. DOI
2. PMID or arXiv ID
3. exact title
4. normalized title plus first author and year

Record how many duplicates were removed.

### 5. Screen Sources

Screen in stages:

1. title
2. abstract
3. full text

For systematic work, record exclusion reasons:

- wrong population
- wrong intervention
- wrong outcome
- not primary research
- duplicate
- unavailable full text
- outside date range

### 6. Extract Data

Use a structured extraction table:

```markdown
| Study | Design | Population/Data | Method | Comparator | Outcome | Key finding | Limitations |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Author Year | RCT/cohort/review/etc. | sample or corpus | method | baseline | measured outcome | result | caveat |
```

For technical papers, include dataset, benchmark, metric, baseline, and
reproducibility notes.

### 7. Synthesize

Group evidence by theme rather than summarizing papers one by one.

Useful synthesis lenses:

- strongest evidence
- conflicting evidence
- methodological weaknesses
- population or dataset limits
- recency and replication
- practical implications
- unanswered questions

Separate claims by confidence:

- **High confidence**: replicated, high-quality evidence across sources.
- **Medium confidence**: plausible but limited by sample, method, or recency.
- **Low confidence**: early, speculative, single-source, or weakly measured.

### 8. Verify Citations

Before finalizing:

- verify DOI, PMID, arXiv ID, or official URL
- check author names and publication year
- do not cite a paper for a claim it does not make
- mark preprints as preprints
- distinguish reviews from primary evidence

## Output Template

```markdown
# Literature Review: <Topic>

Generated: <date>
Review type: <narrative | scoping | systematic | meta-analysis>
Search window: <dates>
Databases: <list>

## Research Question

## Search Strategy

## Inclusion and Exclusion Criteria

## Evidence Summary

## Thematic Synthesis

## Gaps and Limitations

## References

## Search Log
```

## Pitfalls

- Do not treat search snippets as evidence.
- Do not mix preprints, reviews, and primary studies without labeling them.
- Do not omit negative or conflicting findings.
- Do not claim systematic-review rigor without a reproducible protocol.
- Do not use a single database for a broad claim unless the scope is explicitly
  limited to that database.


## Sub-skill: scientific-thinking-scholar-evaluation

# Scholar Evaluation

Use this skill to evaluate academic or scientific work with a repeatable rubric.

## When to Use

- Reviewing a research paper, proposal, thesis chapter, or literature review.
- Checking whether claims are supported by cited evidence.
- Evaluating methodology, study design, analysis, or limitations.
- Comparing two or more papers for quality or relevance.
- Producing structured feedback for revision.

## Evaluation Scope

Start by identifying the artifact:

- empirical research paper
- theoretical paper
- technical report
- systematic or narrative literature review
- research proposal
- thesis or dissertation chapter
- conference abstract or short paper

Then choose scope:

- **comprehensive**: all rubric dimensions
- **targeted**: one or two dimensions, such as method or citations
- **comparative**: rank multiple works against the same rubric

## Rubric

Score each applicable dimension from 1 to 5:

- 5: excellent; clear, rigorous, and publication-ready
- 4: good; minor improvements needed
- 3: adequate; meaningful gaps but usable
- 2: weak; substantial revision needed
- 1: poor; major validity or clarity problems

Use `N/A` for dimensions that do not apply.

### 1. Problem and Research Question

- Is the problem clear and specific?
- Is the contribution meaningful?
- Are scope and assumptions explicit?
- Does the question match the claimed contribution?

### 2. Literature and Context

- Is relevant prior work covered?
- Does the work synthesize rather than merely list sources?
- Are gaps accurately identified?
- Are recent and foundational sources balanced?

### 3. Methodology

- Does the method answer the research question?
- Are design choices justified?
- Are variables, datasets, participants, or materials described clearly?
- Could another researcher reproduce the work?
- Are ethical and practical constraints acknowledged?

### 4. Data and Evidence

- Are data sources credible and appropriate?
- Is sample size or corpus coverage adequate?
- Are inclusion, exclusion, and preprocessing decisions documented?
- Are missing data and bias risks discussed?

### 5. Analysis

- Are statistical, qualitative, or computational methods appropriate?
- Are baselines and controls fair?
- Are uncertainty, sensitivity, or robustness checks included when needed?
- Are alternative explanations considered?

### 6. Results and Interpretation

- Are results clearly presented?
- Do claims stay within the evidence?
- Are figures, tables, and metrics understandable?
- Are negative or null results handled honestly?

### 7. Limitations and Threats to Validity

- Are limitations specific rather than generic?
- Are internal, external, construct, and conclusion-validity risks addressed?
- Does the paper distinguish speculation from demonstrated results?

### 8. Writing and Structure

- Is the argument easy to follow?
- Are sections organized around the research question?
- Are definitions and notation clear?
- Is the tone precise and scholarly?

### 9. Citations

- Do cited papers support the claims attached to them?
- Are primary sources used where possible?
- Are reviews labeled as reviews?
- Are preprints labeled as preprints?
- Are citation metadata and links correct?

## Review Process

1. Read the abstract, introduction, figures, and conclusion for claimed
   contribution.
2. Read methods and results for evidence quality.
3. Check the strongest claims against cited sources.
4. Score each applicable dimension.
5. Separate critical blockers from revision suggestions.
6. End with concrete next edits.

## Output Template

```markdown
# Scholar Evaluation: <Artifact>

## Overall Assessment

- Overall score: <1-5 or N/A>
- Confidence: <high | medium | low>
- Summary: <3-5 sentences>

## Dimension Scores

| Dimension | Score | Evidence | Revision priority |
| --- | ---: | --- | --- |
| Problem and question |  |  |  |
| Literature and context |  |  |  |
| Methodology |  |  |  |
| Data and evidence |  |  |  |
| Analysis |  |  |  |
| Results and interpretation |  |  |  |
| Limitations |  |  |  |
| Writing and structure |  |  |  |
| Citations |  |  |  |

## Critical Issues

## Recommended Revisions

## Evidence Checks Needed
```

## Pitfalls

- Do not use the score as a substitute for concrete feedback.
- Do not penalize a paper for omitting a dimension outside its scope.
- Do not treat citation count, venue, or author reputation as proof of quality.
- Do not accept unsupported claims just because they appear in the abstract.


## Sub-skill: research-ops

# Research Ops

Use this when the user asks to research something current, compare options, enrich people or companies, or turn repeated lookups into a monitored workflow.

This is the operator wrapper around the repo's research stack. It is not a replacement for `deep-research`, `exa-search`, or `market-research`; it tells you when and how to use them together.

## Skill Stack

Pull these ECC-native skills into the workflow when relevant:

- `exa-search` for fast current-web discovery
- `deep-research` for multi-source synthesis with citations
- `market-research` when the end result should be a recommendation or ranked decision
- `lead-intelligence` when the task is people/company targeting instead of generic research
- `knowledge-ops` when the result should be stored in durable context afterward

## When to Use

- user says "research", "look up", "compare", "who should I talk to", or "what's the latest"
- the answer depends on current public information
- the user already supplied evidence and wants it factored into a fresh recommendation
- the task may be recurring enough that it should become a monitor instead of a one-off lookup

## Guardrails

- do not answer current questions from stale memory when fresh search is cheap
- separate:
  - sourced fact
  - user-provided evidence
  - inference
  - recommendation
- do not spin up a heavyweight research pass if the answer is already in local code or docs


## ZeaZ Platform & apps/* Monorepo Rules
When implementing tasks on the `zeaz-platform` repository, you MUST strictly enforce these architecture and workflow rules:
1. **Monorepo Architecture (apps/*)**: The platform is a unified monorepo. ALL applications, microservices, frontends, and AI toolings (e.g., zLinebot, zwallet, zdash) reside inside the `apps/` directory. Do not create top-level directories for apps. When refactoring or adding features, always scope your work to the specific `apps/<app-name>/` folder.
2. **Environment Variables**: Avoid scattering `.env` files. Consolidate environment variables into a central `.env.example` inside the respective app folder. Canonical Cloudflare variables (e.g. `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`) MUST be used instead of legacy `CF_` variants.
3. **Commit Workflow**: NEVER use `git commit` or `git push` directly. ALWAYS stage your intended files with `git add` and commit using `make gpg-finalize COMMIT_MSG="..."` from the repository root to ensure all GitOps and DevSecOps checks pass.
4. **Security**: NEVER commit or generate real secrets. Unsafe placeholders like `replace-me`, `changeme`, `dummy-secret` are FORBIDDEN.
5. **Language**: Code, documentation, and technical definitions MUST be in English.

## Workflow

### 1. Start from what the user already gave you

Normalize any supplied material into:

- already-evidenced facts
- needs verification
- open questions

Do not restart the analysis from zero if the user already built part of the model.

### 2. Classify the ask

Choose the right lane before searching:

- quick factual answer
- comparison or decision memo
- lead/enrichment pass
- recurring monitoring candidate

### 3. Take the lightest useful evidence path first

- use `exa-search` for fast discovery
- escalate to `deep-research` when synthesis or multiple sources matter
- use `market-research` when the outcome should end in a recommendation
- hand off to `lead-intelligence` when the real ask is target ranking or warm-path discovery

### 4. Report with explicit evidence boundaries

For important claims, say whether they are:

- sourced facts
- user-supplied context
- inference
- recommendation

Freshness-sensitive answers should include concrete dates.

### 5. Decide whether the task should stay manual

If the user is likely to ask the same research question repeatedly, say so explicitly and recommend a monitoring or workflow layer instead of repeating the same manual search forever.

## Output Format

```text
QUESTION TYPE
- factual / comparison / enrichment / monitoring

EVIDENCE
- sourced facts
- user-provided context

INFERENCE
- what follows from the evidence

RECOMMENDATION
- answer or next move
- whether this should become a monitor
```

## Pitfalls

- do not mix inference into sourced facts without labeling it
- do not ignore user-provided evidence
- do not use a heavy research lane for a question local repo context can answer
- do not give freshness-sensitive answers without dates

## Verification

- important claims are labeled by evidence type
- freshness-sensitive outputs include dates
- the final recommendation matches the actual research mode used


## Sub-skill: research-synthesize

# Research Synthesize

Synthesize accumulated research findings into actionable reports.

## When to use

After running deep-research (one or multiple times), when you need to pull together findings from memory into a coherent synthesis with recommendations.

## Steps

1. **Gather findings** — search across research namespaces:
   - `mcp__claude-flow__memory_search` namespace `research` for raw findings
   - `mcp__claude-flow__memory_search` namespace `research-sources` for references
   - `mcp__claude-flow__agentdb_pattern-search` for discovered patterns
   - `mcp__claude-flow__agentdb_context-synthesize` for AI-assisted context building
2. **Grade evidence** — for each finding, assess:
   - **High**: Multiple independent sources agree, directly observed, reproducible
   - **Medium**: Single credible source, indirectly supported, plausible
   - **Low**: Anecdotal, single unverified source, speculative
3. **Resolve contradictions** — when findings conflict:
   - Identify the specific claim in tension
   - Compare evidence quality
   - Check recency (newer data may supersede)
   - Note unresolved contradictions explicitly
4. **Predict relevance** — call `mcp__claude-flow__neural_predict` to score which findings are most relevant to the original goal
5. **Structure report**:
   - Executive summary (2-3 sentences answering the original question)
   - Key findings (ranked by evidence quality)
   - Methodology (what sources were checked)
   - Limitations (what wasn't checked, what remains uncertain)
   - Recommendations (concrete next actions)
   - References (source links and memory keys)
6. **Store synthesis** — call `mcp__claude-flow__memory_store` namespace `research-synthesis` with the full report

## Output format

```
# [Research Topic] — Synthesis Report

## Summary
[2-3 sentence answer]

## Key Findings
1. [Finding] — Evidence: High/Medium/Low
2. [Finding] — Evidence: High/Medium/Low

## Contradictions
- [Claim A] vs [Claim B]: [resolution or "unresolved"]

## Recommendations
1. [Action] — because [reasoning]

## Sources
- [key]: [description]
```
