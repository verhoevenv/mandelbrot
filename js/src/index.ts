type Complex = [number, number];
type Bounds = {
    top_left: Complex,
    bottom_right: Complex,
}

function complex(real: number, complex: number): Complex {
    return [real, complex];
}


function real(c: Complex) {
    return c[0];
}

function imaginary(c: Complex) {
    return c[1];
}

function add(a: Complex, b: Complex): Complex {
    return [
        real(a) + real(b),
        imaginary(a) + imaginary(b)
    ]
}

function mul(a: Complex, b: Complex): Complex {
    return [
        real(a) * real(b) - imaginary(a) * imaginary(b),
        real(a) * imaginary(b) + imaginary(a) * real(b)
    ]
}

function abs_squared(a: Complex): number {
    return real(a) * real(a) + imaginary(a) * imaginary(a)
}

function* fn(c: Complex): Generator<Complex, never, unknown> {
    let x = c;
    while(true) {
        x = fn_next(x, c);
        yield x;
    }
}

function fn_next(fn_prev: Complex, c: Complex) {
	return add(mul(fn_prev, fn_prev), c);
}

function escape_time(fn: Generator<Complex, never, unknown>, max_it: number): number | undefined {
    for (let it = 1; it <= max_it; it++) {
        let result = fn.next();
        if (abs_squared(result.value) > 4) {
            return it;
        }
    }
    return undefined;
}

function draw_fractal(canvas: HTMLCanvasElement, bounds: Bounds) {
    const max_iterations = 200;
	const ctx = canvas.getContext("2d")!;

    for (let row = 0; row < canvas.height; row++) {
        for (let col = 0; col < canvas.width; col++) {
            const c = pixel_to_complex(row, col, bounds, canvas.width, canvas.height)
            let series = fn(c);
            let esc_time = escape_time(series, max_iterations);
            let color = color_map(esc_time, max_iterations);
            draw_pixel(ctx, row, col, color);
        }
    }
}

// not exact, should be center point of pixel, but good enough
function pixel_to_complex(row: number, col: number, complex_bounds: Bounds, canvas_width: number, canvas_height: number): Complex {
    let amount_x = col / canvas_width;
    let amount_y = row / canvas_height;
    let total_x = complex_bounds.bottom_right[0] - complex_bounds.top_left[0];
    let total_y = complex_bounds.bottom_right[1] - complex_bounds.top_left[1];
    return [
        complex_bounds.top_left[0] + (total_x * amount_x),
        complex_bounds.top_left[1] + (total_y * amount_y),
    ]
}

function color_map(esc_time: number | undefined, max_iterations: number): string {
    if (!esc_time) {
        return "black";
    }
    return `hsl(${esc_time} 30% 60%)`
}

function draw_pixel(ctx: CanvasRenderingContext2D, row: number, col: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(col, row, 1, 1);
}

let bounds: Bounds = {
    top_left: complex(-2, 2),
    bottom_right: complex(2, -2),
};


let seahorses: Bounds = {
    top_left: complex(-0.9, 0.5),
    bottom_right: complex(-0.3, -0.1),
};

function dive_into_seahorses(): number[] {
    let result: number[] = [];
    const end = complex(-0.75, 0);
    for (let iterations = 0; iterations < 8; iterations++) {
        const epsilon = Math.pow(10, -iterations);
        let c = add(end, complex(0, epsilon));
        let t = escape_time(fn(c), 10e10)!;
        result.push(t * epsilon);
    }
    return result;
}

function dive_into_butt(): number[] {
    let result: number[] = [];
    const end = complex(0.25, 0);
    for (let iterations = 0; iterations < 15; iterations++) {
        const epsilon = Math.pow(10, -iterations);
        let c = add(end, complex(epsilon, 0));
        let t = escape_time(fn(c), 10e10)!;
        console.log(t);
        result.push(t * Math.sqrt(epsilon));
    }
    return result;
}

const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
draw_fractal(canvas, seahorses);

// let approxs = dive_into_seahorses();
// console.log(approxs)