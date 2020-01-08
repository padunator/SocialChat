/**import { Component, OnInit } from '@angular/core';
import Phaser from 'phaser';
import {User} from '../interfaces/user.model';
import {Subscription} from 'rxjs/internal/Subscription';
import {GameService} from '../services/game.service';
import {GameSocket} from '../Sockets/GameSocket';

@Component({
  selector: 'app-quiz-game',
  templateUrl: './quiz-game.component.html',
  styleUrls: ['./quiz-game.component.css']
})


export class QuizGameComponent implements OnInit {

  phaserGame: Phaser.Game;
  config: Phaser.Types.Core.GameConfig;  constructor() {
    this.config = {
      type: Phaser.AUTO,
      scene: [ NewScene ],
      scale: {
        mode: Phaser.Scale.FIT,
        parent: 'gameContainer',
        height: 600,
        width: 800
      },
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
          gravity: { y: 0 }
        }
      }
    };
  }

  ngOnInit() {
    this.phaserGame = new Phaser.Game(this.config);
  }
}


class NewScene extends Phaser.Scene  {
  private otherPlayers: any;

  constructor(private gameService: GameService, private gameSocket: GameSocket) {
    super({ key: 'new' });
  }


  preload() {
    this.load.image('otherPlayer', 'assets/enemyBlack5.png');
    this.load.image('ship', 'assets/spaceShips_001.png');
    this.load.image('star', 'assets/star_gold.png');

  }

  create() {
    const self = this;
    // this.socket = io();
    this.otherPlayers = this.physics.add.group();
    // Socket events
    this.gameSocket.on('currentPlayers',  (players) => {
      Object.keys(players).forEach(function (id) {
        if (players[id].playerId === self.socket.id) {
          this.addPlayer(self, players[id]);
        } else {
          this.addOtherPlayers(self, players[id]);
        }
      });
    });
    this.gameSocket.on('newPlayer',  (playerInfo) => {
      this.addOtherPlayers(self, playerInfo);
    });
    this.gameSocket.on('disconnect',  (playerId) => {
      self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerId === otherPlayer.playerId) {
          otherPlayer.destroy();
        }
      });
    });
    this.gameSocket.on('playerMoved',  (playerInfo) => {
      self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId) {
          otherPlayer.setRotation(playerInfo.rotation);
          otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        }
      });
    });
    this.gameSocket.on('scoreUpdate', function (scores) {
      self.blueScoreText.setText('Blue: ' + scores.blue);
      self.redScoreText.setText('Red: ' + scores.red);
    });
    this.gameSocket.on('starLocation', function (starLocation) {
      if (self.star) {
        self.star.destroy();
      }
      self.star = self.physics.add.image(starLocation.x, starLocation.y, 'star');
      self.physics.add.overlap(self.ship, self.star, function () {
        this.socket.emit('starCollected');
      }, null, self);
    });
    // End of socket events
    this.blueScoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#0000FF' });
    this.redScoreText = this.add.text(584, 16, '', { fontSize: '32px', fill: '#FF0000' });

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    if (this.ship) {
      if (this.cursors.left.isDown) {
        this.ship.setAngularVelocity(-150);
      } else if (this.cursors.right.isDown) {
        this.ship.setAngularVelocity(150);
      } else {
        this.ship.setAngularVelocity(0);
      }

      if (this.cursors.up.isDown) {
        this.physics.velocityFromRotation(this.ship.rotation + 1.5, 100, this.ship.body.acceleration);
      } else {
        this.ship.setAcceleration(0);
      }

      this.physics.world.wrap(this.ship, 5);

      // emit player movement
      var x = this.ship.x;
      var y = this.ship.y;
      var r = this.ship.rotation;
      if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y || r !== this.ship.oldPosition.rotation)) {
        this.socket.emit('playerMovement', { x: this.ship.x, y: this.ship.y, rotation: this.ship.rotation });
      }

      // save old position data
      this.ship.oldPosition = {
        x: this.ship.x,
        y: this.ship.y,
        rotation: this.ship.rotation
      };
    }
  }

  addPlayer(self, playerInfo) {
    self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    if (playerInfo.team === 'blue') {
      self.ship.setTint(0x0000ff);
    } else {
      self.ship.setTint(0xff0000);
    }
    self.ship.setDrag(100);
    self.ship.setAngularDrag(100);
    self.ship.setMaxVelocity(200);
  }

  addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    if (playerInfo.team === 'blue') {
      otherPlayer.setTint(0x0000ff);
    } else {
      otherPlayer.setTint(0xff0000);
    }
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
  }
}

*/
