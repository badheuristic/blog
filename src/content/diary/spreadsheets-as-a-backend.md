---
title: spreadsheets as a backend, on purpose
date: 2026-11-04
summary: Why a validation workflow for hub locations ran on a spreadsheet for a while, and what moves into the main application next.
tags: [data, workflow]
draft: true
---

My team has been working on a long-term project to correct inaccurate hub location data in our database. We have a number of hubs scattered around a few remote locations, and the lack of accurate location data has been a compounding problem that has affected the company's ability to efficiently organize its operations. I am part of a small "task force" that was assigned to addressing this. To push us towards our goal, I built a validation tool that compares recorded locations against site staff submissions and GPS readings from the hubs' own designated phones. Both data sources had to be developed as part of the project. The tool uses them to classify hubs as ready for updates, requiring review, or needing further investigation.

The validation logic was straightforward but there were a few things to consider about the workflow that would be built around it. I had to collect data, publish the results, get people to review discrepancies, preserve their decisions. We needed to complete this phase of the project quickly without making premature changes to production or building infrastructure we didn't need yet. Rather than build all the components from scratch I opted to use a spreadsheet.

We were already using spreadsheets to inspect the existing data, so extending that workflow was more practical than introducing a whole new interface. The requirements were also changing as we learned more about the data, and a spreadsheet made it easy to adjust without repeatedly changing the main application. I also didn't have direct access to the production database. Keeping the work separate let me iterate without introducing unnecessary risk or waiting on database changes. Given our deadlines and the size of the team, setting up a separate service for a database didn't seem worth the additional overhead.

Initially, I downloaded the data manually, ran the tool, and copied the results back. Within about a week, I had automated that process using a lightweight script that moved data between the tool and the spreadsheet on a regular schedule. The spreadsheet acted as both a report and an interface between the automated processing and the people responsible for reviewing the results. A problem though with my method of copying back the results was that human input was overwritten. I knew this would happen so I separated the human decisions from the automated outputs and incorporated this human input in subsequent runs. This also gave us a record of past decisions and a way to determine whether they still applied when the underlying data changed.

I'm proud of taking ownership of this part of the project in the way that I did but, a spreadsheet has obvious limitations. It was suitable for coordinating a workflow that was still evolving but it's definitely not enough to store business data indefinitely. I think that goes without saying. The actual coordinates, the actual underlying location readings, and the permanent record of changes need stronger guarantees and those belong in the production database. The spreadsheet was only chosen to accelerate the correction process with specific time and resource constraints.

The next phase is moving the parts that need to last out of the spreadsheet and into the main application. The validated location readings will be stored in the database with their source, so each correction can point to the evidence behind it. Corrections will be applied in small batches (with dry-runs first) that only change a hub if its location is still what we expected and every change will be permanently recorded. Reviews will move to a page in the application where reviewers confirm suggested location on a map or place a pin themselves. Once that's done, the spreadsheet will have served its purpose.

```diagram
src: hub-architecture
caption: Where it's heading: the parts that need to last, in the main application.
```
