import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {GameService} from '../services/game.service';
import {Subscription} from 'rxjs/internal/Subscription';
import {HighScore} from '../interfaces/high_score';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';



@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
/**
 * This code serves as logic, view & style related component fpr the result page of the Quiz Game
 */
export class ResultComponent implements OnInit, AfterViewInit, OnDestroy {
  /**
   * Defines the actual columns of the High Score Table shown in the Result Page
   */
  displayedColumns = ['User', 'Score', 'Date'];
  /**
   * Subscription which gets called as soon as high scores are loaded from the DB
   */
  private highScoreSub: Subscription;
  /**
   * The actual high score data loaded from the DB
   */
  private highScoreTable: HighScore[] = [];
  /**
   * Data Source definition for the Angular Material Table
   */
  private dataSource = new MatTableDataSource<any>(this.highScoreTable);
  /**
   * Definition for pagination within the high score table
   */
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;

  /**
   * Constructor with injected object instances needed during game execution
   * @param gameService The game service which holds all game related data
   * @param router Router for switching between pages
   */
  constructor(private gameService: GameService, private router: Router) { }

  /**
   * OnInit method which gets called always, as soon as the page is opened or reloaded
   * Holds all subscriptions and the related logic to be executed as soon the events take place
   */
  ngOnInit() {

    this.gameService.restoreGameDate();
    // this.loadData();
    if (parseInt(localStorage.getItem('qnProgress'), 10) !== this.gameService.questions.length) {
      this.router.navigate(['/game']);
    }
    this.highScoreTable = JSON.parse(localStorage.getItem('table')) || '';
    if (this.highScoreTable.length !== 0) {
      this.dataSource.data = this.highScoreTable;
    }

    this.highScoreSub = this.gameService.getHighScoreLoadedListener().subscribe((table: HighScore[]) => {
      console.log('UPDATING DATA SOURCE!');
      this.highScoreTable = table;
      this.dataSource.data = this.highScoreTable;
      localStorage.setItem('table', JSON.stringify(this.highScoreTable));
    });
  }

  /**
   * Method which resets game related data from local storage if game is restarted
   */
  restart() {
    localStorage.setItem('qnProgress', '0');
    localStorage.setItem('questions', '');
    localStorage.setItem('seconds', '0');
    localStorage.setItem('selection', JSON.stringify(true));
    this.router.navigate(['/game']);
  }

  /**
   * Method to get back to the chat page and delete the actual game data from the local storage
   */
  backToChat() {
    this.gameService.clearLocalGameStorage();
    this.gameService.seconds = 0;
    this.router.navigate(['/chat']);
  }

  /**
   * Needed method for a functional pagination
   */
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  /**
   * Unsubscribe existent subscriptions
   */
  ngOnDestroy(): void {
    this.highScoreSub.unsubscribe();
  }

  /**
   * Alternative method for loading the high scores from the DB when Result Page is loaded (not used at the moment)
   */
  private loadData() {
   this.gameService.getHighScores().subscribe((scores) => {
     this.dataSource.data = scores.scores;
     localStorage.setItem('table', JSON.stringify(this.highScoreTable));
     if (this.displayedColumns.length === 0) {
       this.displayedColumns = Object.keys(scores[0]);
     }
   });
  }
}
