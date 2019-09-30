title: Making the flag of India using Pug and Less
published: true
date: August 31, 2019
categories: html, css, pug, less
cover_image: assets/cover.png
----------------------------------------------------------------------

In this article we shall make the national flag of India (the tricolour). As an aside and fun fact, a number of other countries have national flags featuring 3 colours and the Indian flag actually has 4 colours.

![Tricolour](https://thepracticaldev.s3.amazonaws.com/i/jwymep5tm3xvcevmv5vy.png)

So let's start with defining the colours as defined in the Flag Code of India which contains the specifications for the Indian national flag.


```css

// navy blue
@blue: #000080;

// india saffron 
@saffron: #ff9933;

// india green
@green: #138808;

// pure white
@white: #ffffff;

```

The flag will, of course, have 3 rectangular sections for the saffron, white and green parts and the white section will have the wheel of Ashoka in the center. The wheel will have a small inner circle at the center and 24 spokes. So, let's write down that structure in Pug.

```pug
html
  body
    .flag
      .saffron
      .white
        .wheel
          .wheel-center
          - var n = 24
          while n --> 0
            .spoke
      .green
```

The structure is simple enough. We have a `div` with class `flag` as the container for the flag sections. This `div` contains the saffron, white and green sections (which are also `div`s with relevant classes. The white section contains a `div` with class `wheel` and the wheel contains a `div` with class `wheel-center` (this will be the smaller circle at the center of the wheel) and 24 `div`s with class `spoke` (these will be the 24 spokes). We have generated the 24 spokes using a `while` loop. Pug supports 2 mechanisms for iteration; `each` and `while`. `each` is useful when iterating over lists (Javascript arrays) and `while` is useful when iterating until a certain condition is met. Here we want to iterate 24 times, therefore we use the `while` loop with a condition. First we define a variable `n` and set it to 24. Then in each iteration we decrease the value of `n` by 1 using the `decrement operator --` and check if the value has reached 0.


Now that we have the structure of the flag in Pug, let's style it using Less. First, let's set everything to have `box-sizing: border-box` and set up the `body` to have a dark background and center its only child, which is the flag `div`. It's easier to center anything using flexbox. We will set up a `mixin` to be a flex container that centers its children both horizontally and vertically and apply that `mixin` on `body`.

```css
* {
  box-sizing: border-box;
}

// mixin to center children using flex
// The parentheses at the end are optional, because the mixin does not
// take any arguments. But it's a good practice to use the parentheses
// always, so that we can tell at a glance that this is a mixin and not 
// a class.
.center-elements () {
  display: flex;
  align-items: center;
  justify-content: center;
}

body {
  background: #1d1e22;
  width: 100%;
  height: 100vh;

  // apply the center-elements mixin.
  .center-elements();
}
```

Next let's style the flag `div` and the 3 coloured sections of the flag. According to the Flag code of India the flag must have a ratio of two-by-three, i.e. the value of `width / height` must be `1.5` . Here for simplicity we shall use fixed values `675px` and `450px` for width and height of the flag. _This is not responsive, of course. But let's keep things simple._

Also, each of the 3 sections of the flag will have height of `150px` and `100%` width. The white section will have a additional padding of `15px` and it will center its children (its only child will be the wheel).

```css
.flag {
  width: 675px;
  height: 450px;
}

.saffron, .white, .green {
  width: 100%;
  height: 150px;
}

.saffron {
  background: @saffron;
}

.green {
  background: @green;
}

.white {
  background: @white;
  padding: 15px;
  .center-elements();
}
```

Now that we have the sections, let's style the wheel of Ashoka. As the height of the white section is `150px` and we have a padding of `15px` on it (on all sides), the available height for the wheel is `120px`. The wheel is a perfect circle, therefore its width will also be `120px` and it will have a border-radius of `60px` or `50%`. We will also set its `position` to be `relative`, so that when we set `position: absolute` on the spokes, they will position themselves with respect to the wheel `div` instead of the `body`. The wheel will have a blue coloured border of `4px` width for the rim. It will also center its children using the mixin we defined above.

At the center of the wheel, there will be the `wheel-center` `div`. This is a small blue circle of `20px` width and height.

```css
.wheel {
  position: relative;
  width: 120px;
  height: 120px;
  
  border-radius: 50%;
  border: 4px @blue solid;
  
  overflow: hidden;
  .center-elements();
}

.wheel-center {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: @blue;
}
```

Now the only things left to style are the spokes. The problem is, there are 24 of them and if we try to style them all individually, it will be complete mess. That's where the less mixins come to our aid, we can define
a mixin that can apply itself recursively for a specified number of times. Using such a mixin, we can generate the repeating parts of the css rulesets for the 24 spokes. 

Each spoke has the same properties, except for the rotation. Because the whleel is 360 degrees and there are 24 spokes, difference between any two adjacent spokes must be 15 degrees. That is, each spoke must have a rotation value 15 degrees higher than its previous spoke.

All of the spokes must be positioned absolutely with respect to the center of the wheel and their rotation must be applied from the center of the wheel (or from the end of the spoke that is towards the center of the wheel), rather than from the center of the spoke itself. Because the top-left corner of the spoke will be at the center of the wheel, the transform origin of the spoke will be at its top-left corner.

The wheel has a dimension of `120px` with `4px` border. Therefore the available space inside the wheel has dimension of `112px` and its center must lie at `(56px, 56px)`. We will position the spokes at `top: 56px; left: 56px` to have the top-left corner of the spokes at the center of the wheel. Now we can play around with the `width, height` and `skew` them a bit to get the desired shape for the spokes. After a few tries, I found that `width: 31px; height: 4px; transform: skew(84deg);` gives the desired shape of the spoke.

As an additional decorative, we can add the small semi-circular indentations on the rim of the wheel between the spokes. This can be made using an `::after` psuedo element for each of the spoke. We can position them absolutely and style them as small circles to get the desired effect.


```css
.spoke {
  position: absolute;
  left: 56px;
  top: 56px;
  
  width: 31px;
  height: 4px;
  background: @blue;
  
  transform-origin: 0 0;
  
  &:after {
    content: ' ';
    position: absolute;
    top: 2px;
    left: -25px;
    
    display: block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: @blue;
    
    transform: skew(-84deg)translate(1px,3px);
  }
}

// recursive mixin to generate the nth-of-type rulesets for spokes
// terminate when the value of @n reaches 26
.gen-spokes (@n) when (@n = 26) {}

// when value of @n is less than 26, generate the ruleset for the nth
// spoke and then apply self with the next value (@n + 1)
.gen-spokes (@n) when (@n < 26) {
  @selector: ~".spoke:nth-of-type(@{n})";
  @{selector} {
    transform: rotateZ(@n * 15deg)skew(84deg);
  }
  @next: (@n+1);
  .gen-spokes(@next);
}

.gen-spokes(1);

```



Here is the pen containing the code we discussed in this post. 

<p class="codepen" data-height="265" data-theme-id="0" data-default-tab="result" data-user="gnsp" data-slug-hash="oNveGGj" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="Flag of India">
  <span>See the Pen <a href="https://codepen.io/gnsp/pen/oNveGGj">
  Flag of India</a> by Ganesh Prasad (<a href="https://codepen.io/gnsp">@gnsp</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>

So, that's that and we have the national flag of India made using Pug and Less. 

**Like this post ?**
You can find more works by me at [gnsp.in](https://gnsp.in)

Thanks for reading !

