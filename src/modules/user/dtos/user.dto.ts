
export class UserDto {
    id: string;
    name: string;
    email: string;
    lastLogin: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    password?: string;
}