/**
 * Emoji Selection - Code reference at https://morioh.com/p/b683020160b4
 *
 * Stefan Paduretu - Bachelor - Social Learning App
 */

import { NgModule } from '@angular/core';
import { FeatherModule } from 'angular-feather';
import {Smile, Camera, Github} from 'angular-feather/icons';

const icons = {
  Smile,
  Camera,
  Github
};

@NgModule({
  imports: [
    FeatherModule.pick(icons)
  ],
  exports: [
    FeatherModule
  ]
})
export class IconsModule { }
