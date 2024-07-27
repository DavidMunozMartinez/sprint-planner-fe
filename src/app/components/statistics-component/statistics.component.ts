import { KeyValuePipe } from "@angular/common";
import { Component, computed, input, output } from "@angular/core";

type Data = {
  name: string,
  value: number,
}

@Component({
  selector: 'statistics-component',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  standalone: true,
  imports: [KeyValuePipe]
})
export class StatisticsComponent {
  data = input<Data[]>([])
  average = computed(() => this.computeAverage(this.data()));
  frequencies = computed(() => this.computeFrequencies(this.data()));

  private computeAverage(data: Data[]) {
    const filtered = data
    .filter(data => data.value > 0)  
    return filtered
    .reduce((prev, current) => {
      prev += current.value;
      return prev;
    }, 0) / filtered.length;
  }

  private computeFrequencies(data: Data[]) {
    const filtered = data.filter(data => data.value > 0) 
    const values = filtered
      .reduce((prev, current) => {
        if (!prev[current.value]) {
          prev[current.value] = [];
        }
        prev[current.value].push(current.name);
        return prev;
      }, {} as { [key: string]: string[] })

    return values;   
  }

  sort(a: any, b: any) {
    return a.key > b.key ? 1 : -1; 
  }
}