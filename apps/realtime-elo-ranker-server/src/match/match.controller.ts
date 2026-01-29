import { Controller, Post, Body } from '@nestjs/common';
import { MatchService, MatchResult } from './match.service';
import { MatchInputDto } from './dto/match-input.dto';

@Controller('api/match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post()
  async publishMatchResult(@Body() matchInput: MatchInputDto): Promise<MatchResult> {
    return this.matchService.publishMatchResult(matchInput);
  }
}
