import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../models/user.model';
import { LoginDto, RegisterDto, UpdateProfileDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, password, fullname } = registerDto;

    // Kiểm tra username đã tồn tại chưa
    const existingUser = await this.userModel.findOne({ username });

    if (existingUser) {
      throw new ConflictException('Username đã tồn tại');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = new this.userModel({
      username,
      password: hashedPassword,
      fullname,
    });

    const savedUser = await newUser.save();

    // Trả về thông tin user (không bao gồm password)
    const { password: _, ...result } = savedUser.toObject();
    return result;
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Tìm user theo username
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new UnauthorizedException('Username hoặc password không đúng');
    }

    // Kiểm tra password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Username hoặc password không đúng');
    }

    // Tạo JWT token
    const payload = { 
      sub: user._id?.toString() || user.id, 
      username: user.username,
      fullname: user.fullname 
    };
    
    const token = this.jwtService.sign(payload);

    // Trả về thông tin user và token
    const { password: _, ...userInfo } = user.toObject();
    return {
      user: userInfo,
      access_token: token,
    };
  }

  async validateUser(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId);
    if (user) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User không tồn tại');
    }
    
    const { password, ...result } = user.toObject();
    return result;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User không tồn tại');
    }

    // Cập nhật thông tin user
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      updateProfileDto,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new UnauthorizedException('Không thể cập nhật thông tin user');
    }

    const { password, ...result } = updatedUser.toObject();
    return result;
  }
}
