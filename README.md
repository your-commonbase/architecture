# Architecture of a Commonbase

## Intro

**A Commonbase is a core data structure for [Personal Library Science](https://www.bramadams.dev/issue-54/).**

Inspired by [commonplace books](https://en.wikipedia.org/wiki/Commonplace_book) and the [Zettelkasten](https://en.wikipedia.org/wiki/Zettelkasten) method, a Commonbase is a modern and enduring framework for managing a personal library over years. 

Engineered for human-first effectiveness without sacrificing computational effecincy, a Commonbase is created to store, search, synthesize and share personal libraries while scaling to tens of thousands (or more!) of entries.

## Store

- Simple ledger format of `[id, data, metadata, created, updated]`
- Tools
  - SQL Database
  - Preprocessors (Optional)
- Recommendations
  - Supabase
  - Middleware API endpoints for different types (`/add`, `/addURL`, `/addImage` for example)

The **store** function creates a new entry in a Commonbase. 

The **data** column is the column that will be indexed by the search indexes.
The **metadata** column is a JSON object that can hold anything worth keeping about an entry, but especially SQL type relations to other IDs in the Commonbase and source URLs.

**Preprocessor functions** massage data into a form that a Commonbase understands. Preprocessors usually live in the environment they are from, or as a middleware layer between the Commonbase  Middleware API and the source environments. 

Example preprocessors include: Chrome extensions, iOS shortcuts, OCR readers, API scripts.

Entries should be **atomic and directly relevant to the librarian** as possible (think highlights of single sentences from a long book for a good example). This will be very important downstream, so adhere to this rule whenever possible.


## Search

- Multiple indexes for the ledger with pointers back to relevant IDs
- Tools
  - Vector Embedding Index
  - Full Text Search Index
- Recommendations
  - PGVector
  - Meilisearch

The **search** function finds an existing entry in a Commonbase.

Searching **multiple indexes** in parallel gets multiple relevant entries from the same query. Seperate indexes allow us to keep our ledger simple and lightweight, without sacrificing computational power that indexes provide.

The **vector index** establishes semantic associations between entries. 

Adding a vector index to a Commonbase allows for **semantic scrolling**, a UX pattern that allows users to [scroll through a tree of relationships in their Commonbase](https://youtu.be/sqHz94CB0vI?si=HAyA9YuRoClvJd0e&t=104).

The **Full Text Search Index** operates as an all-inclusive “Find in Page” function in a Commonbase. Enables search as you type and typo tolerance.

## Synthesis

- Directed Acyclic Graph
- Creative Suite Plug Ins
- Tools
  - Pointer IDs in the metadata
- Recommendations
  - `onAdd(data, parent_id) => id`
    - `id.metadata.parent_id = parent_id;`
    - `parent_id.metadata.comments.push(id);`
  - Integrations with External Creative Software like video editors, DAWs, IDEs, video meetings, etc.

The **synthesis** function utilizes entries in a Commonbase to accomplish an internal or external goal.

The simplest and most useful synthesis function is `comment()`. `comment()` adds an explicit reference to another entry by ID by creating a **threaded architecture** in the Commonbase.

The [thread architecture](https://en.wikipedia.org/wiki/Thread_(online_communication)) is the foundation for establishing explicit relationships between entries in a Commonbase. By using threads we can create a lineage of thought in a Commonbase without any destructive operations on previous entries. An added advantage of threads is that smart commentary improves the value of search by creating a "self-healing" data layer.

**Creative Integrations** allow for use of a Commonbase in environments where it really matters. Being able to search, store, synthesize and share entries in the real world is what makes a Commonbase an effective data structure for humans.

## Share

- Permalinks from IDs
- Tools
  - UUIDs
  - Export as CSV
- Recommendations
  - Frontend App with UUIDs

The **share** function exports an entry(ies) from a Commonbase out into the world. 

Since we created a simple ledger with store above, we can easily export entries from our Commonbase to CSV format.

Take it further by building a frontend application that puts entries at a Internet accessible permalink ID. If your Commonbase ID structure is stable, it is trivial to take the existing ID, thread (optional), and embedding neighbors (optional) as well.

## Conclusion

A Commonbase is a data structure that makes management of a Personal Library efficent for a computer, but more importanly, effective for the human operator. By leveraging Personal Library Science tenets and historical precedence from Zettelkasten and Commonplacing, a Commonbase creates an enduring, useful at scale, and fun to use system of managing moments worth saving. 

You can try these features and more today with [Your Commonbase](https://yourcommonbase.com/), software built for Personal Libraries. Join the waitlist!
