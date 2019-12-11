import { BrowserModule } from '@angular/platform-browser';
import {Injectable, NgModule} from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatBadgeModule,
  MatButtonModule,
  MatCardModule,
  MatExpansionModule, MatIconModule,
  MatInputModule, MatListModule,
  MatProgressBarModule, MatProgressSpinnerModule,
  MatToolbarModule
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
import {appRoutes, AppRoutingModule} from '../routes';
import { environment } from '../environments/environment';
import {AuthInterceptor} from './services/auth-interceptor';
import {SocketIoModule, SocketIoConfig, Socket} from 'ngx-socket-io';
import {RoomSocket} from './Sockets/RoomSocket';
import {GameSocket} from './Sockets/GameSocket';
import {GameService} from './services/game.service';
import { GameComponent } from './game/game.component';
import { GameroomComponent } from './gameroom/gameroom.component';
import { ResultComponent } from './result/result.component';
import {AutosizeModule} from 'ngx-autosize';
import {PickerModule} from '@ctrl/ngx-emoji-mart';

// const config: SocketIoConfig = { url: 'http://localhost:3000/chat', options: {} };


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
  ],
  imports: [
    BrowserModule,
    // RouterModule.forRoot(appRoutes),
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
    SocketIoModule,
    MatProgressBarModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatBadgeModule,
    AutosizeModule,
    // SocketIoModule.forRoot(config)
  ],
  providers: [
    AuthService,
    ChatService,
    GameService,
    ChatSocket, RoomSocket, GameSocket,
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}],
  bootstrap: [AppComponent]
})
export class AppModule { }
