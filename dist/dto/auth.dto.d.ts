export declare class LoginDto {
    username: string;
    password: string;
}
export declare class RegisterDto {
    username: string;
    password: string;
    fullname: string;
    phoneNumber?: string;
    bankNumber?: string;
    bankName?: string;
}
export declare class UpdateProfileDto {
    fullname: string;
    phoneNumber?: string;
    bankNumber?: string;
    bankName?: string;
}
