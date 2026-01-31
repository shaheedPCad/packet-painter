export namespace cables {
	
	export class Cable {
	    id: string;
	    name: string;
	    color: string;
	    coordinates: number[][];
	
	    static createFrom(source: any = {}) {
	        return new Cable(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.color = source["color"];
	        this.coordinates = source["coordinates"];
	    }
	}

}

