import {RouterModule, Routes} from '@angular/router';
import { SignupFormComponent } from './app/Auth/signup-form/signup-form.component';
import { LoginFormComponent } from './app/Auth/login-form/login-form.component';
import { ChatroomComponent } from './app/chatroom/chatroom.component';
import {NgModule} from '@angular/core';
import {AuthGuard} from './app/Auth/auth.guard';
import {GameComponent} from './app/game/game.component';
import {GameroomComponent} from './app/gameroom/gameroom.component';
import {ResultComponent} from './app/result/result.component';
import {NotFoundComponent} from './app/error-pages/not-found/not-found.component';
import {ServerErrorComponent} from './app/error-pages/server-error/server-error.component';

export const appRoutes: Routes = [
    { path: 'signup', component: SignupFormComponent },
    { path: 'login', component: LoginFormComponent },
    { path: 'chat', component: ChatroomComponent, canActivate: [AuthGuard]},
    {path: 'game', component: GameroomComponent, canActivate: [AuthGuard]},
    {path: 'result', component: ResultComponent, canActivate: [AuthGuard]},
    { path: '', redirectTo: '/login', pathMatch: 'full'},
    { path: '404', component: NotFoundComponent},
    { path: '500', component: ServerErrorComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})

export class AppRoutingModule {}
