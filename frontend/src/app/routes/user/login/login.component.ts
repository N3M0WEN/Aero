import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe-decorator';
import { Permission } from 'picsur-shared/dist/dto/permissions.dto';
import { HasFailed } from 'picsur-shared/dist/types';
import { SnackBarType } from 'src/app/models/dto/snack-bar-type.dto';
import { UserPassModel } from 'src/app/models/forms-dto/userpass.dto';
import { PermissionService } from 'src/app/services/api/permission.service';
import { UserService } from 'src/app/services/api/user.service';
import { UtilService } from 'src/app/util/util.service';
import { LoginControl } from '../../../models/forms/login.control';

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  private readonly logger = console;

  private permissions: string[] = [];

  public get showRegister() {
    return this.permissions.includes(Permission.UserRegister);
  }

  model = new LoginControl();
  loginFail = false;

  constructor(
    private userService: UserService,
    private permissionService: PermissionService,
    private router: Router,
    private utilService: UtilService
  ) {}

  ngOnInit(): void {
    const state = history.state as UserPassModel;
    if (state) {
      this.model.putData(state);
      history.replaceState(null, '');
    }

    this.onPermissions();
  }

  @AutoUnsubscribe()
  onPermissions() {
    return this.permissionService.live.subscribe((permissions) => {
      this.permissions = permissions;
    });
  }

  async onSubmit() {
    const data = this.model.getData();
    if (HasFailed(data)) {
      return;
    }

    const user = await this.userService.login(data.username, data.password);
    if (HasFailed(user)) {
      this.logger.warn(user);
      this.loginFail = true;
      return;
    }

    this.utilService.showSnackBar('Login successful', SnackBarType.Success);
    this.router.navigate(['/']);
  }

  async onRegister() {
    this.router.navigate(['/user/register'], {
      state: this.model.getRawData(),
    });
  }
}
