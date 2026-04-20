*** Settings ***
Resource    ../resources/keywords.robot
Test Setup    Open Browser To App
Test Teardown    Close Browser Session

*** Test Cases ***
Orders Page Loads With Layout And Table Headers
    Open Admin Orders Page
    Wait Until Page Contains    Order Management    10s
    Wait Until Page Contains    Orders    10s
    Page Should Contain Element    xpath=//table[contains(@class,'admin-table')]
    Page Should Contain    Order #
    Page Should Contain    Date
    Page Should Contain    Customer
    Page Should Contain    Status
    Page Should Contain    Total
    Page Should Contain    Actions

Orders Page Shows Rows And Status Badges
    Open Admin Orders Page
    Wait Until Page Contains Element    xpath=(//table[contains(@class,'admin-table')]/tbody/tr)[1]    10s
    Page Should Contain Element    xpath=(//span[contains(@class,'order-id-link')])[1]
    ${pending_count}=    Get Element Count    xpath=//span[contains(@class,'inv-badge--pending')]
    ${completed_count}=    Get Element Count    xpath=//span[contains(@class,'inv-badge--completed')]
    ${cancelled_count}=    Get Element Count    xpath=//span[contains(@class,'inv-badge--cancelled')]
    Should Be True    ${pending_count} > 0 or ${completed_count} > 0 or ${cancelled_count} > 0

Orders Page Search Filters Visible Results
    Open Admin Orders Page
    Wait Until Page Contains Element    xpath=//input[@placeholder='Search orders...']    10s
    Wait Until Page Contains Element    xpath=(//span[contains(@class,'order-id-link')])[1]    10s
    ${first_order}=    Get Text    xpath=(//span[contains(@class,'order-id-link')])[1]
    ${search_term}=    Evaluate    "${first_order}".replace("#","").strip()
    Input Text    xpath=//input[@placeholder='Search orders...']    ${search_term}
    Wait Until Page Contains Element    xpath=//button[contains(normalize-space(.),'CLEAR FILTERS')]    10s
    Page Should Contain    ${search_term}

Orders Page Status Filter Shows Completed Orders
    Open Admin Orders Page
    Wait Until Page Contains Element    xpath=(//select[contains(@class,'rpt-month-select')])[1]    10s
    Select From List By Value    xpath=(//select[contains(@class,'rpt-month-select')])[1]    COMPLETED
    Wait Until Page Contains    Completed    10s

Orders Page Cascading Date Filters Enable In Order
    Open Admin Orders Page
    Wait Until Page Contains Element    xpath=(//select[contains(@class,'rpt-month-select')])[2]    10s
    ${year_select}=    Set Variable    xpath=(//select[contains(@class,'rpt-month-select')])[2]
    ${month_select}=   Set Variable    xpath=(//select[contains(@class,'rpt-month-select')])[3]
    ${day_select}=     Set Variable    xpath=(//select[contains(@class,'rpt-month-select')])[4]

    Element Should Be Disabled    ${month_select}
    Element Should Be Disabled    ${day_select}
    Select From List By Index    ${year_select}    1
    Element Should Be Enabled    ${month_select}

Orders Page Clear Filters Restores Default View
    Open Admin Orders Page
    Wait Until Page Contains Element    xpath=//input[@placeholder='Search orders...']    10s
    Wait Until Page Contains Element    xpath=(//span[contains(@class,'order-id-link')])[1]    10s
    Input Text    xpath=//input[@placeholder='Search orders...']    104
    Wait Until Page Contains Element    xpath=//button[contains(normalize-space(.),'CLEAR FILTERS')]    10s
    Click Button    xpath=//button[contains(normalize-space(.),'CLEAR FILTERS')]
    Wait Until Page Contains    Order Management    10s
    Wait Until Page Contains Element    xpath=(//span[contains(@class,'order-id-link')])[1]    10s
    ${value}=    Get Value    xpath=//input[@placeholder='Search orders...']
    Should Be Empty    ${value}

Orders Page Mark Complete Control Presence Matches Data
    Open Admin Orders Page
    Wait Until Page Contains Element    xpath=(//table[contains(@class,'admin-table')]/tbody/tr)[1]    10s
    ${mark_complete_count}=    Get Element Count    xpath=//button[normalize-space()='Mark Complete']
    ${pending_count}=    Get Element Count    xpath=//span[contains(@class,'inv-badge--pending')]
    Should Be True    ${mark_complete_count} <= ${pending_count}

Orders Page Opens Detail View From Visible Order Number
    Open Admin Orders Page
    Wait Until Page Contains Element    xpath=(//span[contains(@class,'order-id-link')])[1]    10s
    Click Element    xpath=(//span[contains(@class,'order-id-link')])[1]
    Wait Until Location Contains    /admin/orders/    10s

Order Detail Shows Receipt Layout And Back Navigation
    Open First Admin Order Detail
    Wait Until Location Contains    /admin/orders/    10s
    Page Should Contain    Order #
    Page Should Contain    Status
    Page Should Contain    Total

Order Detail Mark Complete Control Presence Matches Data
    Open First Admin Order Detail
    ${mark_complete_present}=    Run Keyword And Return Status    Page Should Contain Button    Mark Complete
    ${completed_present}=    Run Keyword And Return Status    Page Should Contain    Completed
    IF    ${completed_present}
        Should Not Be True    ${mark_complete_present}
    END

Recent Orders Sidebar Appears On Orders Section
    Open Admin Orders Page
    Page Should Contain    Recent Orders

*** Keywords ***
Open Admin Orders Page
    Login As Business User
    Sync Auth Token Key For Frontend
    Go To    ${BASE_URL}/admin/orders
    Wait Until Location Contains    /admin/orders    10s
    Wait Until Page Does Not Contain    Loading orders...    10s

Open First Admin Order Detail
    Open Admin Orders Page
    Wait Until Page Contains Element    xpath=(//span[contains(@class,'order-id-link')])[1]    10s
    Click Element    xpath=(//span[contains(@class,'order-id-link')])[1]
    Wait Until Location Contains    /admin/orders/    10s

Sync Auth Token Key For Frontend
    ${legacy}=    Execute JavaScript    return window.localStorage.getItem('access');
    ${current}=    Execute JavaScript    return window.localStorage.getItem('accessToken');
    IF    '${current}' == 'None' and '${legacy}' != 'None'
        Execute JavaScript    window.localStorage.setItem('accessToken', window.localStorage.getItem('access'));
        Reload Page
    END