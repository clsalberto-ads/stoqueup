import { AbilityBuilder, createMongoAbility, MongoAbility } from "@casl/ability"

export type UserRole = "admin" | "manager" | "user"

export type Actions = "manage" | "read" | "create" | "update" | "delete"

export type Subjects =
    | "Dashboard"
    | "Sales"
    | "Products"
    | "Production"
    | "Metrics"
    | "Settings"
    | "all"

export type AppAbility = MongoAbility<[Actions, Subjects]>

export function defineAbilityFor(role: UserRole) {
    const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility)

    switch (role) {
        case "admin":
            can("manage", "all")
            break

        case "manager":
            can("read", "Dashboard")
            can("manage", "Sales")
            can("manage", "Products")
            can("read", "Metrics")
            break

        case "user":
            can("read", "Dashboard")
            can("manage", "Production")
            break
    }

    return build()
}
