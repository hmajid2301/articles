/// <reference types="../support/index" />
/// <reference types="cypress" />
/// <reference types="@types/cypress-axe" />

describe("Component accessibility test", () => {
  it("Main Page", () => {
    cy.visit("/")
    cy.wait(500)
    cy.injectAxe()
    cy.checkA11y({
      include: [["#___gatsby"]],
    })
  })
})
