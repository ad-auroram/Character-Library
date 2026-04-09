Project Overview
My plan for a web application is to build a character library where users can create and organize original characters for writing, tabletop games, game concepts, and more. This app will be designed for people who want one place to store character stats, images and descriptions. Users will also be able to generate printable character sheets for their characters.
The core user experience is:
•	Create an account and manage a profile.
•	Add and edit character entries with structured fields (name, role, stats, tags, notes, image gallery).
•	Search and filter by tags.
•	Save favorite characters to a personal bookmarks tab.
•	Generate a printable PDF character sheet.
•	Use AI assistance to generate or improve a character summary from the structured character data.

Planned Features and Tasks
Main features for the application include authentication and user accounts, character management, bookmarks, and background worker and PDF generation. I plan to use the supabase starter from the last assignment as a jumping off point. Then I can set up user-to-character relationships in the database and make sure users can only edit their own characters. 
Character pages will include stats, tags, images, and a description. There will also be a Quick Build mode using a D&D API to help users pick out basic character info. I plan for character tags to be searchable. Characters can also be set to public or private. Private characters will be visible only to the user they belong to. Users will also be able to bookmark characters. Each user will have a tab on their profile where bookmarks are displayed.
Implementation tasks for Characters:
•	Design schema for Character, Tag, and CharacterImage tables.
•	Build forms for create/edit with validation.
•	Implement list/detail UI views.
•	Add filter queries by tag and text search.
•	Add D&D 5e API integration for class/race/spell reference data used by Quick Build.
•	Map API response fields into local character form defaults and allow manual overrides.
•	Add Bookmark table linking users and characters

I plan to integrate AI by giving an option to generate a description of the character based on stats and information filled out otherwise. I’ll be learning how to integrate the OpenAI API with my app for this. Users will be able to save the generated descriptions to the character page or edit/overwrite it.
Implementation tasks for AI:
•	Create server-side endpoint that builds prompt from character fields.
•	Integrate LLM provider API.
•	Add save/overwrite flow so users can keep generated summaries.
•	Add safety checks and token/error handling.

I’ll be using a background worker for generating the PDFs for character sheets. The background worker will operate as a separate process that consumes jobs from a Redis queue and handles PDF generation asynchronously. Job status or some sort of loading animation will be shown. This will include setting up a template and figuring out how to use a new library to generate the files and download them.
Implementation tasks for PDFs:
•	Add job queue and worker process.
•	Create PDF template and rendering logic from character data.
•	Add retry logic and failure logging for worker jobs.


Technical Requirements and Technology Choices
Database: Supabase. I want to figure out how to set up the project so the database isn’t just local to the app could be deployable to Vercel or similar (without the AI).
Background Worker: BullMQ + Redis. I plan to use the background worker for asynchronous PDF generation. Since the generation can take longer than normal request/response cycles, queue-based processing will keep UI responsive and improve reliability.
LLM Integration: OpenAI API. This will be used to generate character summaries from stats and notes.
New Technologies:
-	Puppeteer or another PDF generator for printable character sheets from HTML/CSS templates.
-	D&D 5e API (dnd5eapi.co) for Quick Build mode that can help users quickly fill in character data such as race, class, and potentially spells and items.
Web Application – NextJS + Typescript

New Knowledge and Open Questions
New Knowledge to Learn
•	Puppeteer PDF templating, print CSS, and server-side rendering constraints.
•	D&D 5e API endpoint structure, response mapping, caching/error handling, and SRD content limits.
•	How to setup Supabase to be accessed through the web and not just locally
•	Prompt design and output validation for LLM-generated summaries.
•	Secure API key and environment variable management in deployment.
Risks and Questions
•	How will PDF generation scale if multiple users request exports simultaneously? 
•	What is the best way to cache or limit D&D API requests to avoid rate limits?
•	PDF complexity: advanced layouts may take more time than expected.
•	External API availability/schema changes could affect Quick Build reliability.
•	Scope control: I may need to defer features (for example, image gallery, tags) to ensure core requirements are completed first.
Mitigation Plan
•	Build a minimum viable version first before extras outside requirements.
•	Implement one stable PDF template before visual polish.
•	Keep fallback options: 
o	Manual description entry if LLM service fails.
o	Manual character entry if D&D API calls fail or return incomplete data.

