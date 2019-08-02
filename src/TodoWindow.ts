import * as util from "./utils";
import { Window } from "./Window";

const $scss = util.css;

util.addStylesheet($scss`
.todo{
	
}
`);

/*

// "virtual dom"

render(){
return [
	i.div(".todo")(
		i.ul(".todoitem")(...items.map(
			i.li(".todovalue")
		))
	)
]

return <>
	<div class="todo">
		<ul>
		</ul>
	</div>
</>
}

*/

export class TodoWindow extends Window {
  constructor() {
    super();
  }
}
