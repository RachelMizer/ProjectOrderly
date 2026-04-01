*** Settings ***
Documentation     Frontend smoke and workflow tests aligned to the existing SeleniumLibrary keyword structure.
...               This file converts the Jest frontend tests into browser-level Robot tests that fit the existing suite.
...               Mock-only Jest cases were omitted because they are not reliable browser tests without controlled API mocking.
Resource          ../resources/keywords.robot
Library           String
Test Setup        Open Browser To App
Test Teardown     Close Browser Session

*** Variables ***
${HOME_TEXT}                      Orderly frontend running...
${POST_LOGIN_TEXT}                Home Page
${REGISTER_SUCCESS_TEXT}          Account created successfully
${RESET_REQUEST_SUCCESS_TEXT}     If an account exists, a reset link has been sent
${PROFILE_SUCCESS_TEXT}           Profile updated successfully

*** Test Cases ***
App Navigation Hides Profile Link When Not Authenticated
    [Documentation]    Browser equivalent of the unauthenticated app navigation Jest test.
    Go To    ${BASE_URL}
    Wait Until Page Contains    Home    10s
    Page Should Not Contain Link    Profile
    Page Should Contain Link    Login
    Page Should Contain Link    Register

App Navigation Shows Profile Link When Authenticated
    [Documentation]    Browser equivalent of the authenticated app navigation Jest test.
    Login As Test User
    Page Should Contain Link    Profile
    Page Should Contain Element    xpath=//button[normalize-space()='Logout']

Login Page Renders Form
    Go To Login Page
    Page Should Contain    Login
    Page Should Contain Element    id=email
    Page Should Contain Element    id=password
    Page Should Contain Element    xpath=//button[normalize-space()='Login']

Successful Login Submits Valid Credentials
    Login As Test User
    Wait Until Page Contains Element    xpath=//a[@href='/profile']    10s
    Page Should Contain Link    Profile

Register Page Renders Form
    Go To    ${BASE_URL}/register
    Wait Until Page Contains Element    id=firstName
    Page Should Contain Element    id=lastName
    Page Should Contain Element    id=email
    Page Should Contain Element    id=password
    Page Should Contain Element    xpath=//button[contains(normalize-space(),'Create Account')]

Register Page Accepts Form Input
    [Documentation]    Safe browser-level version of the register component test.
    Go To    ${BASE_URL}/register
    Wait Until Page Contains Element    id=firstName
    Clear And Type    id=firstName    Kenny
    Clear And Type    id=lastName     Test
    Clear And Type    id=email        kenny.robot@example.com
    Clear And Type    id=password     Password123!
    Textfield Value Should Be    id=firstName    Kenny
    Textfield Value Should Be    id=lastName     Test
    Textfield Value Should Be    id=email        kenny.robot@example.com

Reset Password Request Page Renders Form
    Go To    ${BASE_URL}/password-reset
    Wait Until Page Contains Element    id=email
    Page Should Contain Element    xpath=//button[contains(normalize-space(),'Send Reset Link')]

Reset Password Request Accepts Email Input
    Go To    ${BASE_URL}/password-reset
    Wait Until Page Contains Element    id=email
    Clear And Type    id=email    ${TEST_EMAIL}
    Textfield Value Should Be    id=email    ${TEST_EMAIL}

Reset Password Page Renders Form
    [Documentation]    Uses the same query-string pattern shown in the uploaded Jest test.
    Go To    ${BASE_URL}/reset-password?uid=abc123&token=xyz123
    Wait Until Page Contains Element    id=password
    Page Should Contain Element    xpath=//button[contains(normalize-space(),'Reset Password')]

Reset Password Page Accepts Password Input
    Go To    ${BASE_URL}/reset-password?uid=abc123&token=xyz123
    Wait Until Page Contains Element    id=password
    Clear And Type    id=password    NewPassword123!
    Textfield Value Should Be    id=password    NewPassword123!

Profile Page Loads Existing Data
    Login As Test User
    Open Profile Page
    Page Should Contain Element    id=firstName
    Page Should Contain Element    id=lastName
    Page Should Contain Element    id=streetAddress
    Page Should Contain Element    id=city
    Page Should Contain Element    id=state
    Page Should Contain Element    id=zipcode
    Page Should Contain Element    id=email
    Page Should Contain Element    id=phone

Profile Email Field Is Disabled
    Login As Test User
    Open Profile Page
    Element Should Be Disabled    id=email

Profile Allows Editing Editable Fields
    Login As Test User
    Open Profile Page
    Clear And Type    id=firstName    ${UPDATED_FIRST_NAME}
    Clear And Type    id=city         ${UPDATED_CITY}
    Textfield Value Should Be    id=firstName    ${UPDATED_FIRST_NAME}
    Textfield Value Should Be    id=city         ${UPDATED_CITY}
    Element Should Be Disabled    id=email

Profile Save Submits Updated Data
    Login As Test User
    Open Profile Page
    Clear And Type    id=firstName        ${UPDATED_FIRST_NAME}
    Clear And Type    id=lastName         ${UPDATED_LAST_NAME}
    Clear And Type    id=streetAddress    ${UPDATED_STREET}
    Clear And Type    id=city             ${UPDATED_CITY}
    Clear And Type    id=state            ${UPDATED_STATE}
    Clear And Type    id=zipcode          ${UPDATED_ZIP}
    Clear And Type    id=phone            ${UPDATED_PHONE}
    Click Button    xpath=//button[normalize-space()='Save']
    Wait Until Page Contains    ${PROFILE_SUCCESS_TEXT}
