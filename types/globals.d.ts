export {}

export type Roles="admin" | "pharmacist"

declare global {
    interface CustomJwtSessionClaims{
        metadata:{
            role?:Roles
        }
    }
}