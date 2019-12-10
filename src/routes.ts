import {RouterModule, Routes} from '@angular/router';
import { SignupFormComponent } from './app/Auth/signup-form/signup-form.component';
import { LoginFormComponent } from './app/Auth/login-form/login-form.component';
import { ChatroomComponent } from './app/chatroom/chatroom.component';
import {NgModule} from '@angular/core';
import {AuthGuard} from './app/Auth/auth.guard';
import {GameComponent} from './app/game/game.component';
import {GameroomComponent} from './app/gameroom/gameroom.component';
import {ResultComponent} from './app/result/result.component';

export const appRoutes: Routes = [
    { path: 'signup', component: SignupFormComponent },
    { path: 'login', component: LoginFormComponent },
    { path: 'chat', component: ChatroomComponent, canActivate: [AuthGuard]},
    {path: 'game', component: GameroomComponent, canActivate: [AuthGuard]},
    {path: 'result', component: ResultComponent, canActivate: [AuthGuard]},
    { path: '', redirectTo: '/login', pathMatch: 'full'},
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})

export class AppRoutingModule {}
