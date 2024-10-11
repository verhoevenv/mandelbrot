use hsl::HSL;
use image::{ImageBuffer, Rgb};

const MAX_ITERATIONS: usize = 100;

#[derive(Copy, Clone, Debug)]
struct Complex {
    re: f64,
    im: f64
}

impl Complex {
    fn new(re: f64, im: f64) -> Complex {
        Complex {
            re,
            im
        }
    }

    fn add(self, other: Self) -> Self {
        Complex {
            re: self.re + other.re,
            im: self.im + other.im
        }
    }

    fn sq(self) -> Self {
        Complex {
            re: self.re * self.re - self.im * self.im,
            im: 2.0 * self.re * self.im,
        }
    }

    fn abs_sq(self) -> f64 {
        self.re * self.re + self.im * self.im
    }
}

struct Bounds {
    bottom_left: Complex,
    size: f64
}

impl Bounds {
    pub(crate) fn value(&self, frac_x: f64, frac_y: f64) -> Complex {
        Complex {
            re: self.bottom_left.re + (frac_x * self.size),
            im: self.bottom_left.im + (frac_y * self.size)
        }
    }
}

fn mandelbrot_seq(c: Complex) -> impl Iterator<Item=Complex> {
    std::iter::successors(Some(c), move |previous| {
        Some(previous.sq().add(c))
    })
}

fn mandelbrot_escape_time(c: Complex) -> Option<usize> {
    mandelbrot_seq(c)
        .enumerate()
        .take(MAX_ITERATIONS)
        .find(|(_, c)| c.abs_sq() > 4.0)
        .map(|(i, _)| i)
}

fn color_map(escape_time: Option<usize>) -> Rgb<u8> {
    match escape_time {
        None => Rgb([0u8, 0u8, 0u8]),
        Some(time) => {
            let time_frac = time as f64 / MAX_ITERATIONS as f64;
            let angle = time_frac * 360f64;
            let color = HSL { h: angle, s: 0.3_f64, l: 0.6_f64 };
            Rgb(color.to_rgb().into())
        }
    }
}

fn mandelbrot(b: Bounds, resolution: u32) -> ImageBuffer<Rgb<u8>, Vec<u8>> {
    let mut imgbuf = image::ImageBuffer::new(resolution, resolution);

    // Iterate over the coordinates and pixels of the image
    for (x, y, pixel) in imgbuf.enumerate_pixels_mut() {
        let c = b.value(x as f64 / resolution as f64, y as f64 / resolution as f64);
        *pixel = color_map(mandelbrot_escape_time(c));
    }

    imgbuf
}

fn main() {
    let bounds = Bounds {
        bottom_left: Complex::new(-2.0, -2.0),
        size: 4.0,
    };
    let img = mandelbrot(bounds, 1000);
    img.save("out/fractal.png").unwrap();
}