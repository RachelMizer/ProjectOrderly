# Orderly | Project Plan

##### Project Name:   **Orderly**

##### Team Number:   Group #7

##### Team Project Manager / Scrum Master:   Serina Rodriguez

---

## Team Member Details

| NamE           | Email                     | Role |
| -------------- | ------------------------- | ---- |
| Kenny Bacdayan | kbacdayan@my.waketech.edu | Testing Lead  |
| Caleb Fowlkes  | cjfowlkes@my.waketech.edu | Technical Writer  |
| Tristin Gatt   | tjgatt@my.waketech.edu    | Software Architect  |
| Kim Mayo       | kamayo@my.waketech.edu    | Product Owner  |
| Rachel Mizer   | ramizer@my.waketech.edu   | TBD  |
| Tyler Royal    | taroyal@my.waketech.edu   | TBD  |

## Project Goal

Provide a lightweight, web-based ordering software with a customer facing ordering experience and business-owner facing dashboard that allows for menu customization, inventory control, sales data reports, and supplier management.

## Project Objectives

1. **Deliver a fully-functional application by April 24th, 2026 that** includes a customer ordering interface, business management dashboard, and basic inventory tracking with demonstrated order processing capabilities. 
2. **Reduce order processing time by 50%** compared to traditional manual ordering methods by implementing an intuitive self-service interface which minimizes human error and wait times. 
3. **Achieve 90% user satisfaction rating** during prototype testing by providing a responsive design that works across multiple devices such as tablets, kiosks, and mobile devices with a user-friendly navigation system.

## Project Scope

#### In-Scope:

- Customer-facing interface for browsing, customizing, and submitting orders
- Business-facing interface for managing menus, inventory, and prices
- Basic reporting dashboard for sales summaries and popular iems
- Responsive design compatible with tables, kiosks, and mobile devices
- User authentication and role-based access control
- Simulated payment processing for protoype demonstration
- Prototype supplier order management system tracking orders from submission to fulfillment.

#### Out of Scope:

- Integration with live payment gateways (Stripe or PayPal)
- Integration with external POS systems
- Advanced analytics or AI-based recommendations
- Customer loyalty programs or promotional features
- Multi-language and multi-currency support
- Real supplier API integration

## Project Assumptions

1. All Team members have consistent internet access and functioning devices capable of running development and collaboration tools.
2. Each member has access to shared resources (Trello, Microsoft Teams, Outlook, Google Drive, GitHub).
3. Stakeholders and project mentor (TBD) will provide timely feedbak during sprint reviews. 
4. The system will operate in a simulated environment during development (no real payment processing required)
5. Test data will be fictional to maintain privacy and comply with ethical standards. 
6. Broadband internet connectivity is available for real-time data synchronization.
7. Modern web browsers are available on all developing and testing devices. 

## Project Constraints

#### Time Constraints:

- Fixed deadline of April 24th, 2026 for final project presentation and all deliverables. 
- Five sprint cycles with specific milestones and deliverables

#### Resource Constraints:

- Limited to team of seven members. 
- Academic project budget (no funding for paid services or API)
- Prototype-level development only (not production ready)

#### Technical Constraints:

- Must use agreed-upon development stack
- Limited to 100 GB storage capacity
- No access to real payment gateway APIs during prototype phase
- Dependency on availability of external APIs for future enhancements

#### Scope Constraints:

- Cannot implement payment processing integration in current phase
- Cannot integrate with external POS systems in current timeline

## Project Resources Required 

#### Personnel:

- **Director of Product Development**: Professor Alex Tabbal
- **Project Manager**: Serina Rodriguez
- **Development Team**: Kenny Bacdayan, Caleb Fowlkes, Tristin Gatt, Kim Mayo, Rachel Mizer, Tyler Royal
- **Project Mentor**: To be determined..

#### Technology & Tools:

- **Development**: React / Django / DRF / SimpleJWT / AWS / SQLite / Git
- **Project Management**: Trello for sprint tracking and task management
- **Communication**: Microsoft Teams, Outlook
- **Documentation**: Google Drive, Microsoft Teams
- **Database**: Django / SQLite

#### Hardware:

	- Team member laptops/desktops for development
	- Testing devices: tablets, mobile devices for respnsive design testing
	- Server/cloud hosting (AWS or Azure for deployment)

#### Software:

	- Modern web browsers (Chrome, Edge, Safari) for testing
	- AES-256 encryption for data security
	- HTTPS/SSL for secure communication

---

## Team Collaboration and Communication

#### Tools/Platforms:

- **Microsoft Teams**: Primary platform for daily communication, virtual meetings, chat discussions, and file sharing.
- **Outlook**: Email communication, scheduling, deadline management, and meeting invitations
- **Trello**: Sprint planning, task coorodination, and progress updates

#### Usage:

- **Daily/Weekly Check-ins via Teams:** Monitor sprint progress, address blockers, coordinate tasks
- **Sprint Planning Meetings**: Team collaborates to select and assign tasks from product backlog
- **Sprint Reviews:** Present completed features and gather feedback from stakeholders
- **Sprint Retrospectives:** Discuss what worked well, challenges encountered, and process improvements
- **Real-Time Chat:** Teams chat for quick questions and immediate collaboration needs

## Project Documentation

#### Tools/Plaforms:

- **Google Drive**: Central Repository for all project documents with version control
- **Trello**: Technical documentation of user stories, acceptance criteria, and task details
- **GitHub:** Code documentation, READMEfiles, and version control comments

#### Usage:

- **SCRUM Artifacts**: Stored in MSTeams, GitHub with consistent formatting and name conventions
- **Design Documents**: Architectural diagrams, ERDs, wireframes, and class diagrams maintained in GitHub
- **Meeting Notes**: Meeting summaries, Sprint Review, and Retrospective notes documented and shared via GitHub and MS Teams
- **Presentation Files**: Final presentation materials organized in Google Drive and Github repository
-  **Version Control**: All documents follow naming conventions to track revisions and maintain professional standards
- **Code Documentation**: Developed code, inline comments and README files maintained in GitHub repository

## Project Management Plan and Methodologies


#### Methodology:

The Orderly development team has adopted Agile SCRUM as project management methodology based on its proven strengths in iterative devleopment, team communication, flexibility, and integration of customer and/or stakeholder feedback. The approach is well-suited to the academic timeline and need to demonstrate incremental progress throughout the semester.

The Agile SCRUM approach ensures iterative delivery, maintains transparency, and allows the team to adapt quickly while meeting the April 24th deadline.

#### Tools:

Trello serves as the primary project management tool, providing capabilities for backlog organization, sprint tracking, and Kanban board visualization. These features give the team real-time visibility into progress and help identify potential issues before they become critical blockers. 

#### Process:

**Sprint Structure (6 sprints, 2 weeks each):**

1. Sprint 1 (01/31-02/13): 
	+ High level design
	+ UX Concept
	+ Application Architecture
	+ Stable Development Environment

2. Sprint 2 (02/14-02/27): 
	+ Prototype Design
	+ User Accounts
	+ Rough Backend, Frontend, and DB

3. Sprint 3 (02/28-03/13): 
	+ Deploy to cloud environment
	+ JWT Auth
	+ Customer and Business UI

**COLLEGE CLOSED - Break (03/16-03/20)**

4. Sprint 4 (03/31-04/03): 
	+ Security
	+ Remaining User and Business Features
	+ Finalize UI

5. Sprint 5 (04/04-04/17): 
	+ Test and Iterate UX for Desktop and Mobile
	+ Determine and Solve Critical Bugs

6. Sprint 6 (04/18-05/01): 
	+ Finalize Application
	+ Project Documentation Release
	+ Final Sprint 5 Retrospective
	+ Presentation
	+ Evaluation

**Progress Tracking:**

- Visual Management through Kanban Boards
- Sprint Burndown Charts to monitor progress
- Weekly Check-ins to identify blockers early in MS Teams by all team members

**Review Cycle:**

- **Sprint Review:** Demonstrate completed features, gather stakeholder feedback
- **Sprint Retrospective**: Evalulate process, identify improvements for next iteration
- **Continuous Adaptation**: Adjust approach based on feedback and lessons learned

---

