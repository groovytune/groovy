<script lang="ts">
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
    import { BoomBoxIcon } from '@lucide/svelte';
    import { Button } from '$lib/components/ui/button';
    import { FieldDescription, FieldGroup, FieldLegend, FieldSet, Field, FieldLabel, FieldSeparator } from '$lib/components/ui/field';
    import { Input } from '$lib/components/ui/input';
    import { Select, SelectContent, SelectTrigger, SelectItem } from '$lib/components/ui/select';
    import { Checkbox } from '$lib/components/ui/checkbox';
    import { Textarea } from '$lib/components/ui/textarea';

    let month = $state<string>();
    let year = $state<string>();
</script>

<div class="grid sm:grid-cols-2 md:grid-cols-3 gap-2 p-2">
    <Card>
        <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Buttons are used to trigger an action or event, such as submitting a form, opening a dialog, canceling an action, or performing a delete operation.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
            <FieldGroup>
                <Field>
                    <FieldLabel>Default</FieldLabel>
                    <FieldDescription>Default button variant and its size</FieldDescription>
                    <div class="flex gap-2 items-center">
                        <Button size="lg" variant="default">Large</Button>
                        <Button size="default" variant="default">Default</Button>
                        <Button size="sm" variant="default">Small</Button>
                        <Button size="icon" variant="default"><BoomBoxIcon/></Button>
                        <Button size="icon-sm" variant="default"><BoomBoxIcon/></Button>
                    </div>
                </Field>
                <Field>
                    <FieldLabel>Secondary</FieldLabel>
                    <FieldDescription>Secondary button variant and its size</FieldDescription>
                    <div class="flex gap-2 items-center">
                        <Button size="lg" variant="secondary">Large</Button>
                        <Button size="default" variant="secondary">Default</Button>
                        <Button size="sm" variant="secondary">Small</Button>
                        <Button size="icon" variant="secondary"><BoomBoxIcon/></Button>
                        <Button size="icon-sm" variant="secondary"><BoomBoxIcon/></Button>
                    </div>
                </Field>
                <Field>
                    <FieldLabel>Outline</FieldLabel>
                    <FieldDescription>Outline button variant and its size</FieldDescription>
                    <div class="flex gap-2 items-center">
                        <Button size="lg" variant="outline">Large</Button>
                        <Button size="default" variant="outline">Default</Button>
                        <Button size="sm" variant="outline">Small</Button>
                        <Button size="icon" variant="outline"><BoomBoxIcon/></Button>
                        <Button size="icon-sm" variant="outline"><BoomBoxIcon/></Button>
                    </div>
                </Field>
                <Field>
                    <FieldLabel>Destructive</FieldLabel>
                    <FieldDescription>Destructive button variant and its size</FieldDescription>
                    <div class="flex gap-2 items-center">
                        <Button size="lg" variant="destructive">Large</Button>
                        <Button size="default" variant="destructive">Default</Button>
                        <Button size="sm" variant="destructive">Small</Button>
                        <Button size="icon" variant="destructive"><BoomBoxIcon/></Button>
                        <Button size="icon-sm" variant="destructive"><BoomBoxIcon/></Button>
                    </div>
                </Field>
                <Field>
                    <FieldLabel>Link</FieldLabel>
                    <FieldDescription>Link button variant and its size</FieldDescription>
                    <div class="flex gap-2 items-center">
                        <Button size="lg" variant="link">Large</Button>
                        <Button size="default" variant="link">Default</Button>
                        <Button size="sm" variant="link">Small</Button>
                        <Button size="icon" variant="link"><BoomBoxIcon/></Button>
                        <Button size="icon-sm" variant="link"><BoomBoxIcon/></Button>
                    </div>
                </Field>
                <Field>
                    <FieldLabel>Ghost</FieldLabel>
                    <FieldDescription>Ghost button variant and its size</FieldDescription>
                    <div class="flex gap-2 items-center">
                        <Button size="lg" variant="ghost">Large</Button>
                        <Button size="default" variant="ghost">Default</Button>
                        <Button size="sm" variant="ghost">Small</Button>
                        <Button size="icon" variant="ghost"><BoomBoxIcon/></Button>
                        <Button size="icon-sm" variant="ghost"><BoomBoxIcon/></Button>
                    </div>
                </Field>
            </FieldGroup>
        </CardContent>
    </Card>
    <Card>
        <CardHeader>
            <CardTitle>Form Fields</CardTitle>
            <CardDescription>Form fields are used to collect user input. They can be used for a variety of purposes, such as collecting user information, allowing users to search for content, or providing a way for users to submit feedback.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
            <FieldGroup>
                <FieldSet>
                    <FieldLegend>Payment Method</FieldLegend>
                    <FieldDescription>All transactions are secure and encrypted</FieldDescription>
                    <FieldGroup>
                        <Field>
                            <FieldLabel for="checkout-7j9-card-name-43j">Name on Card</FieldLabel>
                            <Input
                                id="checkout-7j9-card-name-43j"
                                placeholder="John Doe"
                                required
                            />
                        </Field>
                        <div class="grid grid-cols-3 gap-4">
                            <Field class="col-span-2">
                                <FieldLabel for="checkout-7j9-card-number-uw1">Card Number</FieldLabel>
                                <Input
                                    id="checkout-7j9-card-number-uw1"
                                    placeholder="1234 5678 9012 3456"
                                    required
                                />
                                <FieldDescription>Enter your 16-digit number.</FieldDescription>
                            </Field>
                            <Field class="col-span-1">
                                <FieldLabel for="checkout-7j9-cvv">CVV</FieldLabel>
                                <Input id="checkout-7j9-cvv" placeholder="123" required />
                            </Field>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel for="checkout-7j9-exp-month-ts6">Month</FieldLabel>
                                <Select type="single" bind:value={month}>
                                    <SelectTrigger id="checkout-7j9-exp-month-ts6">
                                        <span>{month || "MM"}</span>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="01">01</SelectItem>
                                        <SelectItem value="02">02</SelectItem>
                                        <SelectItem value="03">03</SelectItem>
                                        <SelectItem value="04">04</SelectItem>
                                        <SelectItem value="05">05</SelectItem>
                                        <SelectItem value="06">06</SelectItem>
                                        <SelectItem value="07">07</SelectItem>
                                        <SelectItem value="08">08</SelectItem>
                                        <SelectItem value="09">09</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="11">11</SelectItem>
                                        <SelectItem value="12">12</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                            <Field>
                                <FieldLabel for="checkout-7j9-exp-year-f59">Year</FieldLabel>
                                <Select type="single" bind:value={year}>
                                    <SelectTrigger id="checkout-7j9-exp-year-f59">
                                        <span>{year || "YYYY"}</span>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2024">2024</SelectItem>
                                        <SelectItem value="2025">2025</SelectItem>
                                        <SelectItem value="2026">2026</SelectItem>
                                        <SelectItem value="2027">2027</SelectItem>
                                        <SelectItem value="2028">2028</SelectItem>
                                        <SelectItem value="2029">2029</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>
                        </div>
                    </FieldGroup>
                </FieldSet>
                <FieldSeparator/>
                <FieldSet>
                    <FieldLegend>Billing Address</FieldLegend>
                    <FieldDescription>The billing address associated with your payment method</FieldDescription>
                    <FieldGroup>
                        <Field orientation="horizontal">
                            <Checkbox id="checkout-7j9-same-as-shipping-wgm" checked={true} />
                            <FieldLabel for="checkout-7j9-same-as-shipping-wgm" class="font-normal">
                                Same as shipping address
                            </FieldLabel>
                        </Field>
                    </FieldGroup>
                </FieldSet>
                <FieldSeparator />
                <FieldSet>
                    <FieldGroup>
                        <Field>
                            <FieldLabel for="checkout-7j9-optional-comments">Comments</FieldLabel>
                            <Textarea
                                id="checkout-7j9-optional-comments"
                                placeholder="Add any additional comments"
                                class="resize-none"
                            />
                        </Field>
                    </FieldGroup>
                </FieldSet>
                <Field orientation="horizontal">
                    <Button type="submit">Submit</Button>
                    <Button variant="outline" type="button">Cancel</Button>
                </Field>
            </FieldGroup>
        </CardContent>
    </Card>
    <Card>
        <CardHeader>
            <CardTitle>Colors</CardTitle>
            <CardDescription>Colors are used to create a visual hierarchy, establish brand identity, and evoke emotions. They can be used to draw attention to important elements, create contrast, and improve readability.</CardDescription>
        </CardHeader>
        <CardContent>
            <FieldGroup>
                <Field>
                    <FieldLabel>Primary</FieldLabel>
                    <FieldDescription>Primary color and their shades</FieldDescription>
                    <div class="flex gap-2">
                        <div class="size-8 rounded-sm bg-primary border"></div>
                        <div class="size-8 rounded-sm bg-primary/90 border"></div>
                        <div class="size-8 rounded-sm bg-primary/80 border"></div>
                        <div class="size-8 rounded-sm bg-primary/70 border"></div>
                        <div class="size-8 rounded-sm bg-primary/60 border"></div>
                        <div class="size-8 rounded-sm bg-primary/50 border"></div>
                        <div class="size-8 rounded-sm bg-primary/40 border"></div>
                        <div class="size-8 rounded-sm bg-primary/30 border"></div>
                        <div class="size-8 rounded-sm bg-primary/20 border"></div>
                        <div class="size-8 rounded-sm bg-primary/10 border"></div>
                    </div>
                </Field>
                <Field>
                    <FieldLabel>Secondary</FieldLabel>
                    <FieldDescription>Secondary color and their shades</FieldDescription>
                    <div class="flex gap-2">
                        <div class="size-8 rounded-sm bg-secondary border"></div>
                        <div class="size-8 rounded-sm bg-secondary/90 border"></div>
                        <div class="size-8 rounded-sm bg-secondary/80 border"></div>
                        <div class="size-8 rounded-sm bg-secondary/70 border"></div>
                        <div class="size-8 rounded-sm bg-secondary/60 border"></div>
                        <div class="size-8 rounded-sm bg-secondary/50 border"></div>
                        <div class="size-8 rounded-sm bg-secondary/40 border"></div>
                        <div class="size-8 rounded-sm bg-secondary/30 border"></div>
                        <div class="size-8 rounded-sm bg-secondary/20 border"></div>
                        <div class="size-8 rounded-sm bg-secondary/10 border"></div>
                    </div>
                </Field>
                <Field>
                    <FieldLabel>Accent</FieldLabel>
                    <FieldDescription>Primary color and their shades</FieldDescription>
                    <div class="flex gap-2">
                        <div class="size-8 rounded-sm bg-accent border"></div>
                        <div class="size-8 rounded-sm bg-accent/90 border"></div>
                        <div class="size-8 rounded-sm bg-accent/80 border"></div>
                        <div class="size-8 rounded-sm bg-accent/70 border"></div>
                        <div class="size-8 rounded-sm bg-accent/60 border"></div>
                        <div class="size-8 rounded-sm bg-accent/50 border"></div>
                        <div class="size-8 rounded-sm bg-accent/40 border"></div>
                        <div class="size-8 rounded-sm bg-accent/30 border"></div>
                        <div class="size-8 rounded-sm bg-accent/20 border"></div>
                        <div class="size-8 rounded-sm bg-accent/10 border"></div>
                    </div>
                </Field>
                <Field>
                    <FieldLabel>Foreground</FieldLabel>
                    <FieldDescription>Foreground color and their shades</FieldDescription>
                    <div class="flex gap-2">
                        <div class="size-8 rounded-sm bg-foreground border"></div>
                        <div class="size-8 rounded-sm bg-foreground/90 border"></div>
                        <div class="size-8 rounded-sm bg-foreground/80 border"></div>
                        <div class="size-8 rounded-sm bg-foreground/70 border"></div>
                        <div class="size-8 rounded-sm bg-foreground/60 border"></div>
                        <div class="size-8 rounded-sm bg-foreground/50 border"></div>
                        <div class="size-8 rounded-sm bg-foreground/40 border"></div>
                        <div class="size-8 rounded-sm bg-foreground/30 border"></div>
                        <div class="size-8 rounded-sm bg-foreground/20 border"></div>
                        <div class="size-8 rounded-sm bg-foreground/10 border"></div>
                    </div>
                </Field>
                <Field>
                    <FieldLabel>Background</FieldLabel>
                    <FieldDescription>Background color and their shades</FieldDescription>
                    <div class="flex gap-2">
                        <div class="size-8 rounded-sm bg-background border"></div>
                        <div class="size-8 rounded-sm bg-background/90 border"></div>
                        <div class="size-8 rounded-sm bg-background/80 border"></div>
                        <div class="size-8 rounded-sm bg-background/70 border"></div>
                        <div class="size-8 rounded-sm bg-background/60 border"></div>
                        <div class="size-8 rounded-sm bg-background/50 border"></div>
                        <div class="size-8 rounded-sm bg-background/40 border"></div>
                        <div class="size-8 rounded-sm bg-background/30 border"></div>
                        <div class="size-8 rounded-sm bg-background/20 border"></div>
                        <div class="size-8 rounded-sm bg-background/10 border"></div>
                    </div>
                </Field>
                <Field>
                    <FieldLabel>Destructive</FieldLabel>
                    <FieldDescription>Destructive color and their shades</FieldDescription>
                    <div class="flex gap-2">
                        <div class="size-8 rounded-sm bg-destructive border"></div>
                        <div class="size-8 rounded-sm bg-destructive/90 border"></div>
                        <div class="size-8 rounded-sm bg-destructive/80 border"></div>
                        <div class="size-8 rounded-sm bg-destructive/70 border"></div>
                        <div class="size-8 rounded-sm bg-destructive/60 border"></div>
                        <div class="size-8 rounded-sm bg-destructive/50 border"></div>
                        <div class="size-8 rounded-sm bg-destructive/40 border"></div>
                        <div class="size-8 rounded-sm bg-destructive/30 border"></div>
                        <div class="size-8 rounded-sm bg-destructive/20 border"></div>
                        <div class="size-8 rounded-sm bg-destructive/10 border"></div>
                    </div>
                </Field>
            </FieldGroup>
        </CardContent>
    </Card>
</div>
