# Workflow for the project

The basic workflow for the project can be described as follows:

```mermaid
graph LR
1A[Issue] --Labeled--> 1B{good first issue}
1A --Reopened--> 1B
1A --Unassigned--> 1B
1B --Store--> 1C((Database))

1C --Retrieve--> 2A[Website]

1C --Every 5 minutes--> 3A[Tweet]

1A --Unlabeled--> 4A{good first issue}
1A --Closed--> 4A
1A --Assigned--> 4A
1A --Deleted--> 4A
4A --> 4B[Delete Tweet]
4B --Delete--> 1C
```
