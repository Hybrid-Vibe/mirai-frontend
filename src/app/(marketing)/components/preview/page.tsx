import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const buttonVariants = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
] as const;
const buttonSizes = ["xs", "sm", "default", "lg"] as const;
const inputSizes = ["sm", "md", "lg"] as const;
const cardVariants = ["default", "elevated", "interactive"] as const;
const cardPaddings = ["sm", "md", "lg"] as const;
const badgeVariants = [
  "primary",
  "accent",
  "muted",
  "danger",
  "success",
  "warning",
  "outline",
] as const;

export default function ComponentsPreviewPage() {
  return (
    <main className="bg-background py-12">
      <div className="page-shell space-y-10">
        <header className="space-y-3">
          <p className="type-caption text-(--mirai-sem-accent)">
            Core Component Library
          </p>
          <h1 className="type-display-lg text-foreground">
            Components Preview
          </h1>
          <p className="type-body-md max-w-3xl text-muted-foreground">
            Preview noi bo cho Phase 2. Tat ca components su dung semantic token
            contract va typography utility classes.
          </p>
        </header>

        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Button</CardTitle>
            <CardDescription>
              Variants: primary, secondary, outline, ghost, danger. Sizes: sm,
              md, lg. States: default, disabled, loading, active, focus.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              {buttonVariants.map((variant) => (
                <div key={variant} className="space-y-2">
                  <p className="type-caption text-muted-foreground">
                    variant: {variant}
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    {buttonSizes.map((size) => (
                      <Button
                        key={`${variant}-${size}`}
                        variant={variant}
                        size={size}
                      >
                        {variant} {size}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4">
              <Button variant="default" disabled>
                Disabled
              </Button>
              <Button variant="default" loading loadingText="Dang xu ly...">
                Loading
              </Button>
              <Button variant="outline" className="translate-y-px">
                Active (preview)
              </Button>
              <Button
                variant="ghost"
                className="ring-2 ring-ring ring-offset-2 ring-offset-background"
              >
                Focus (preview)
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Input va Textarea</CardTitle>
            <CardDescription>
              Variants: default, error. Sizes: sm, md, lg. States: default,
              focus, disabled, error.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <p className="type-body-sm font-semibold text-foreground">
                Input sizes
              </p>
              <div className="grid gap-3 md:max-w-xl">
                {inputSizes.map((size) => (
                  <Input
                    key={`input-${size}`}
                    size={size}
                    placeholder={`Input ${size}`}
                  />
                ))}
                <Input placeholder="Focus state (autoFocus)" autoFocus />
                <Input
                  placeholder="Disabled state"
                  disabled
                  defaultValue="Khong the chinh sua"
                />
                <Input
                  placeholder="Error state"
                  variant="error"
                  aria-invalid
                  defaultValue="Gia tri khong hop le"
                />
              </div>
            </div>

            <div className="space-y-4">
              <p className="type-body-sm font-semibold text-foreground">
                Textarea sizes
              </p>
              <div className="grid gap-3 md:max-w-xl">
                {inputSizes.map((size) => (
                  <Textarea
                    key={`textarea-${size}`}
                    size={size}
                    placeholder={`Textarea ${size}`}
                    defaultValue="Noi dung mau"
                  />
                ))}
                <Textarea disabled defaultValue="Disabled textarea" />
                <Textarea
                  variant="error"
                  aria-invalid
                  defaultValue="Noi dung can kiem tra lai"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Card</CardTitle>
            <CardDescription>
              Variants: default, elevated, interactive. Padding: sm, md, lg.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {cardVariants.map((variant) => (
              <Card key={variant} variant={variant} padding="md">
                <CardHeader>
                  <CardTitle>{variant}</CardTitle>
                  <CardDescription>Semantic card surface</CardDescription>
                  <CardAction>
                    <Badge variant="outline">Preview</Badge>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <p className="type-body-sm text-muted-foreground">
                    Card variant nay su dung semantic token va tuong thich dark
                    mode.
                  </p>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button size="sm" variant="outline">
                    Action
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </CardContent>
          <CardContent className="grid gap-4 border-t border-border pt-6 md:grid-cols-3">
            {cardPaddings.map((padding) => (
              <Card key={padding} padding={padding} variant="default">
                <CardHeader>
                  <CardTitle>padding: {padding}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="type-body-sm text-muted-foreground">
                    Khoang cach noi bo cua card.
                  </p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Badge</CardTitle>
            <CardDescription>
              Semantic badge roles cho status va metadata.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            {badgeVariants.map((variant) => (
              <Badge key={variant} variant={variant}>
                {variant}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
