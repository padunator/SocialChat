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
export class ResultComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns = ['User', 'Score', 'Date'];
  private highScoreSub: Subscription;
  private highScoreTable: HighScore[] = [];
  private dataSource = new MatTableDataSource<any>(this.highScoreTable);
  // dataSource = new MatTableDataSource(this.highScoreTable);
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;

  constructor(private gameService: GameService, private router: Router) { }

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


  OnSubmit() {
    // Implmement Promise here for getting score here
    // this.gameService.submitScore().subscribe(() => {
    //   this.restart();
    // });
  }

  restart() {
    localStorage.setItem('qnProgress', '0');
    localStorage.setItem('questions', '');
    localStorage.setItem('seconds', '0');
    localStorage.setItem('selection', JSON.stringify(true));
    this.router.navigate(['/game']);
  }

  backToChat() {
    this.gameService.clearLocalGameStorage();
    this.gameService.seconds = 0;
    this.router.navigate(['/chat']);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.highScoreSub.unsubscribe();
  }

  private loadData() {
   this.gameService.getHighScores().subscribe((scores) => {
     this.dataSource.data = scores.scores;
     console.log('HIGH SCORES RECEIVED!');
     localStorage.setItem('table', JSON.stringify(this.highScoreTable));
     if (this.displayedColumns.length === 0) {
       this.displayedColumns = Object.keys(scores[0]);
     }
   });
  }
}
