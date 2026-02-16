# How to Participate in Planning Poker Tonight

## Quick Overview

We'll be estimating Sprint 2 user stories using **Planning Poker** with **T-shirt sizes** (Small, Medium, Large) to determine how much work each story involves.

------

## Before the Meeting

1. **Join the Planning Poker room:**
   - Click this link: https://planningpokeronline.com/ZnnhQh0wnQ9tMzVLDOnS/
   - Enter your name when prompted
   - You'll see a virtual "poker table" with cards
2. **Have Trello open** (optional but helpful)
   - We'll reference our Sprint 2 backlog

------

## How Planning Poker Works

### Step 1: I'll Read the User Story

I'll present each user story and explain what it involves.

### Step 2: Ask Questions

If anything is unclear, ask! We need everyone to understand what we're estimating.

### Step 3: Everyone Votes Simultaneously

- Click on a card size: **S (Small)**, **M (Medium)**, or **L (Large)**
- Don't show your vote yet - the tool will reveal everyone's votes at the same time
- This prevents "anchoring" where early votes influence others

### Step 4: Discuss If Needed

- **If everyone agrees** (all S, all M, or all L) → Great! We're done with that story
- **If estimates differ** → The person who voted lowest and highest explain their reasoning
- **Then we vote again** until we reach consensus

### Step 5: Record & Move to Next Story

I'll record the final estimate and we move on to the next user story.

------

## What the Sizes Mean

**Think about effort and complexity, not exact hours:**

- **S (Small):** 1-2 days
  - Straightforward, well-understood
  - Example: "Add a simple form field"
- **M (Medium):** 3-5 days
  - Moderate complexity, some uncertainty
  - Example: "Build a login endpoint with validation"
- **L (Large):** 5+ days or needs breakdown
  - Complex, lots of moving parts, high uncertainty
  - Example: "Build entire authentication system"
  - *Note: If we estimate something as Large, we might break it down into smaller stories*

------

## What to Consider When Estimating

✅ **DO consider:**

- Complexity of the work
- How well we understand the requirements
- Dependencies on other work
- Testing and documentation time
- Our existing Sprint 1 foundation (we have ERDs, API contracts, designs ready!)

❌ **DON'T worry about:**

- Who will do it (we'll assign tasks after estimating)
- Exact hours (it's relative sizing, not precise time tracking)
- Being "wrong" (estimates get better over time)

------

## Example Round

**Me:** "User Story 2.4: User Registration. As a new user, I want to create an account with email and password. This includes backend endpoint, password hashing, and a registration form. Questions?"

**Team:** "Do we need email verification in this story?"

**Me:** "No, that's separate (Story 2.5). This is just the basic registration flow."

**Team:** "Got it."

**Me:** "Okay, everyone vote!"

*[Everyone clicks their card size]*

**Tool reveals:**

- Rachel: M
- Tristin: M
- Caleb: S
- Kim: M
- Kenny: M

**Me:** "We have mostly Medium, but Caleb said Small. Caleb, why Small?"

**Caleb:** "We already have the API contract documented, so it's just implementing what's already designed."

**Team:** "Oh good point! Yeah, maybe Small then."

**Me:** "Let's vote again."

*[Everyone votes S]*

**Me:** "Consensus at Small! Moving on..."

------

## Tips for Success

1. **Vote based on YOUR understanding** - not what you think others will vote
2. **Speak up if confused** - better to clarify now than discover issues mid-sprint
3. **Don't overthink it** - we can adjust during the sprint if needed
4. **Remember our Sprint 1 work** - we have a LOT already done (database design, API contracts, UI mockups)
5. **When in doubt, size larger** - it's better to under-promise and over-deliver

------

## Questions?

If anything is unclear about how Planning Poker works, just ask at the start of the meeting!

See you at 7 PM! 🎯

------

**TL;DR:**

1. Join: https://planningpokeronline.com/ZnnhQh0wnQ9tMzVLDOnS/
2. Listen to user story
3. Click your card size (S/M/L)
4. Discuss if votes differ
5. Repeat for 14 stories
6. Done!