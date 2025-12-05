# Choose a diverse team of 5 people to hire and communicate why they were chosen. 

## Hire goals
- delivery speed (PM, 3 * SDE, Data)
  - levels (intern, junior, senior)
  - skills (BE, FE, Full stack)
  - availability (part-time, full-time)
  - education
- cash flow (100M) - salary consideration


## App Design

### MVP (UI)
- Visualize all candidates - group by positions
  - Table (only display work related information) 
    - name, location, availability, skills, salary
- Candidate detail modal 
  - show candidate details (email, phone)
- Manually choose candidate based on the data of each role. 
- Table

### Iteration (Data process logic)
- Design rules to sort the candidate
  - how to match the data from the skills in the resume to a position (FE, BE, Data, PM)
  - how to evaluate the level? 
    - based on the previous experience and title & degree
    - work time (estimated based on the end time of the lastest degreee)
- display the sorted candidate to the hire team
- Hire team can input their requirement (position, skills, salary)

### Further iteration
- Build some features for candidate, they can search company as well. 