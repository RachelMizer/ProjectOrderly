*** Settings ***
Resource   ../resources/keywords.robot
Test Setup     Open Browser To App
Test Teardown  Close Browser Session

*** Test Cases ***
Logged Out User Should Not See Profile Link
    Go To    ${BASE_URL}
    Wait Until Page Contains    Home    10s
    Page Should Not Contain Link    Profile
    Page Should Contain Link    Login
    Page Should Contain Link    Register

Logged In User Can View Profile Page
    Login As Test User
    Wait Until Page Contains Element    xpath=//a[@href='/profile']    10s
    Page Should Contain Link    Profile
    Open Profile Page
    Wait Until Page Contains    My Profile    10s
    Page Should Contain Element    id=firstName
    Page Should Contain Element    id=lastName
    Page Should Contain Element    id=streetAddress
    Page Should Contain Element    id=city
    Page Should Contain Element    id=state
    Page Should Contain Element    id=zipcode
    Page Should Contain Element    id=email
    Page Should Contain Element    id=phone

Email Field Should Be Disabled On Profile Page
    Login As Test User
    Open Profile Page
    Wait Until Page Contains    My Profile    10s
    Element Should Be Disabled    id=email

Logged In User Can Update Profile
    Login As Test User
    Open Profile Page
    Wait Until Page Contains    My Profile    10s

    Clear And Type    id=firstName    ${UPDATED_FIRST_NAME}
    Clear And Type    id=lastName     ${UPDATED_LAST_NAME}
    Clear And Type    id=streetAddress    ${UPDATED_STREET}
    Clear And Type    id=city    ${UPDATED_CITY}
    Clear And Type    id=state    ${UPDATED_STATE}
    Clear And Type    id=zipcode    ${UPDATED_ZIP}
    Clear And Type    id=phone    ${UPDATED_PHONE}

    Click Button    xpath=//button[normalize-space()='Save']
    Wait Until Page Contains    Profile updated successfully    10s

    Reload Page
    Wait Until Page Contains    My Profile    10s

    Textfield Value Should Be    id=firstName    ${UPDATED_FIRST_NAME}
    Textfield Value Should Be    id=lastName     ${UPDATED_LAST_NAME}
    Textfield Value Should Be    id=streetAddress    ${UPDATED_STREET}
    Textfield Value Should Be    id=city    ${UPDATED_CITY}
    Textfield Value Should Be    id=state    ${UPDATED_STATE}
    Textfield Value Should Be    id=zipcode    ${UPDATED_ZIP}
    Textfield Value Should Be    id=phone    ${UPDATED_PHONE}