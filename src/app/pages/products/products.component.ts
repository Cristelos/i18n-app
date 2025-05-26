import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageSelectorComponent } from '../../components/language-selector/language-selector.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, LanguageSelectorComponent],
  templateUrl: './products.component.html',
})
export default class ProductsComponent {}
