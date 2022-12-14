import { BrowserModule } from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatBadgeModule, MatTableModule,
  MatButtonModule,
  MatCardModule, MatCheckboxModule,
  MatExpansionModule, MatIconModule,
  MatInputModule, MatListModule,
  MatProgressBarModule, MatProgressSpinnerModule,
  MatToolbarModule, MatSnackBarModule,  MatPaginatorModule,
  MatSortModule
} from '@angular/material';
import { IconsModule } from './icons/icons.module';
import { AppComponent } from './app.component';
import { ChatFormComponent } from './chat-form/chat-form.component';
import { ChatroomComponent } from './chatroom/chatroom.component';
import { FeedComponent } from './feed/feed.component';
import { MessageComponent } from './message/message.component';
import { LoginFormComponent } from './Auth/login-form/login-form.component';
import { SignupFormComponent } from './Auth/signup-form/signup-form.component';
import { NavbarComponent } from './navbar/navbar.component';
import { UserListComponent } from './user-list/user-list.component';
import { UserItemComponent } from './user-item/user-item.component';

import { ChatService } from './services/chat.service';
import { AuthService } from './services/auth.service';
import {ChatSocket} from './Sockets/ChatSocket';
import {AppRoutingModule} from '../routes';
import {AuthInterceptor} from './services/auth-interceptor';
import {SocketIoModule} from 'ngx-socket-io';
import {GameSocket} from './Sockets/GameSocket';
import {GameService} from './services/game.service';
import { GameComponent } from './game/game.component';
import { GameroomComponent } from './gameroom/gameroom.component';
import { ResultComponent } from './result/result.component';
import {AutosizeModule} from 'ngx-autosize';
import {PickerModule} from '@ctrl/ngx-emoji-mart';
import { NotFoundComponent } from './error-pages/not-found/not-found.component';
import { ServerErrorComponent } from './error-pages/server-error/server-error.component';

@NgModule({
  declarations: [
    AppComponent,
    ChatFormComponent,
    ChatroomComponent,
    FeedComponent,
    MessageComponent,
    LoginFormComponent,
    SignupFormComponent,
    NavbarComponent,
    UserListComponent,
    UserItemComponent,
    GameComponent,
    GameroomComponent,
    ResultComponent,
    NotFoundComponent,
    ServerErrorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    IconsModule,
    PickerModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    SocketIoModule,
    MatProgressBarModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatBadgeModule,
    AutosizeModule,
    MatCheckboxModule,
  ],
  providers: [
    AuthService,
    ChatService,
    GameService,
    ChatSocket,  GameSocket,
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
